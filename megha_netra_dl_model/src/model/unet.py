# Basic U-Net model architecture
# This is a simplified U-Net structure and will likely need adjustments
# based on the specific input data shape (e.g., number of channels) and task.

import torch
import torch.nn as nn
import torch.nn.functional as F

class DoubleConv(nn.Module):
    """(convolution => [BN] => ReLU) * 2"""

    def __init__(self, in_channels, out_channels, mid_channels=None):
        super().__init__()
        if not mid_channels:
            mid_channels = out_channels
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, mid_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(mid_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(mid_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.double_conv(x)

class Down(nn.Module):
    """Downscaling with maxpool then double conv"""

    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.maxpool_conv = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_channels, out_channels)
        )

    def forward(self, x):
        return self.maxpool_conv(x)

class Up(nn.Module):
    """Upscaling then double conv"""

    def __init__(self, in_channels, out_channels, bilinear=True):
        super().__init__()

        # if bilinear, use the normal convolutions to reduce the number of channels
        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
            self.conv = DoubleConv(in_channels, out_channels, in_channels // 2)
        else:
            self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
            # After ConvTranspose2d, in_channels for DoubleConv is (in_channels // 2) from upsampled + in_channels from skip connection
            # So, it should be (in_channels // 2) + (in_channels // 2) if skip connection has same num channels as output of upsample path at that level
            # Or more generally: (channels from upsampled x1) + (channels from x2)
            # The DoubleConv's `in_channels` argument should be `(in_channels // 2) + out_channels_of_corresponding_down_layer`
            # Let's assume the skip connection (x2) has `in_channels // 2` channels if `bilinear` is False,
            # or `in_channels` if `bilinear` is True (as it's passed directly to DoubleConv).
            # The current `in_channels` parameter to `Up` is the number of channels from the layer below (x1).
            # The `out_channels` parameter to `Up` is the desired output channels for this block.
            # The skip connection x2 will have `out_channels` (from previous `Down` layer, or `inc` layer).
            # So, the input to `self.conv` will be `(in_channels // 2)` [from `self.up(x1)`] + `out_channels` [from `x2`].
            # No, this is not right. `in_channels` to `Up` is the number of channels of the feature map from the layer below in the U.
            # `out_channels` is the number of channels this `Up` block should output.
            # If not bilinear: `self.up` outputs `in_channels // 2`. This is `x1_upsampled`.
            # `x2` is the skip connection. Its channels are `in_channels // 2` (because it comes from a `Down` block that output `in_channels // 2` which became `in_channels` for the next `Down` block, or it is the output of `inc`).
            # So, `torch.cat([x2, x1_upsampled], dim=1)` will have `(channels of x2) + (in_channels // 2)`.
            # The `DoubleConv` should take this concatenated channel count as its `in_channels`.
            # The `out_channels` for this `DoubleConv` is the `out_channels` of the `Up` block.
            # Let's look at typical U-Net diagrams.
            # Example: Up(1024, 512 // factor). Here in_channels=1024, out_channels=512//factor.
            # x1 (from below) has 1024 channels. self.up(x1) has 1024//2 = 512 channels.
            # x2 (skip connection from Down block) has 512 channels (or 512//factor if factor applies there too).
            # If x2 has 512 channels, then cat([x2, x1_upsampled]) has 512+512=1024 channels.
            # Then DoubleConv(1024, 512//factor). This matches the bilinear case: DoubleConv(in_channels, out_channels, in_channels // 2)
            # where in_channels here is the sum, and out_channels is the target.
            # So, the `DoubleConv` should be `DoubleConv( (channels of x2) + (channels of x1 after upsampling), out_channels_of_Up_block)`
            # Channels of x2 is `in_channels // 2` (assuming symmetric U-Net path).
            # Channels of x1 after upsampling (`self.up`) is `in_channels // 2`.
            # So, total input to `DoubleConv` is `(in_channels // 2) + (in_channels // 2) = in_channels`.
            self.conv = DoubleConv(in_channels, out_channels) # This seems correct if x2 has in_channels//2 channels.

    def forward(self, x1, x2):
        x1 = self.up(x1) # x1 is now (batch, in_channels//2, H, W)
        # x2 is (batch, channels_from_encoder, H_enc, W_enc)
        # Typically, channels_from_encoder is also in_channels//2 for the symmetric part of U-Net
        # For example, up1(x5, x4): x5 is (1024), x4 is (512). x1 from up is (512). cat(x4, x1) = (512+512=1024).
        # So, if x2 has in_channels//2 channels, then cat([x2, x1], dim=1) will have in_channels.
        # The DoubleConv is defined as DoubleConv(in_channels, out_channels) - this matches.
        # input is CHW
        diffY = x2.size()[2] - x1.size()[2]
        diffX = x2.size()[3] - x1.size()[3]

        x1 = F.pad(x1, [diffX // 2, diffX - diffX // 2,
                        diffY // 2, diffY - diffY // 2])

        # if you have padding issues, see
        # https://github.com/HaiyongJiang/U-Net-Pytorch-Unstructured-Buggy/blob/master/model.py
        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)

class OutConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(OutConv, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=1)

    def forward(self, x):
        return self.conv(x)

class UNet(nn.Module):
    def __init__(self, n_channels, n_classes, bilinear=False):
        super(UNet, self).__init__()
        self.n_channels = n_channels
        self.n_classes = n_classes
        self.bilinear = bilinear

        self.inc = DoubleConv(n_channels, 64)
        self.down1 = Down(64, 128)
        self.down2 = Down(128, 256)
        self.down3 = Down(256, 512)
        factor = 2 if bilinear else 1
        self.down4 = Down(512, 1024 // factor)
        self.up1 = Up(1024, 512 // factor, bilinear)
        self.up2 = Up(512, 256 // factor, bilinear)
        self.up3 = Up(256, 128 // factor, bilinear)
        self.up4 = Up(128, 64, bilinear)
        self.outc = OutConv(64, n_classes)

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)
        x = self.up1(x5, x4)
        x = self.up2(x, x3)
        x = self.up3(x, x2)
        x = self.up4(x, x1)
        logits = self.outc(x)
        return logits

if __name__ == '__main__':
    # Example usage:
    # Assuming 3 input channels (e.g., RGB), 1 output class (e.g., segmentation mask)
    # Input tensor shape: (batch_size, channels, height, width)

    # For CPU testing
    device = torch.device("cpu")

    # For GPU testing, if available
    # if torch.cuda.is_available():
    #    device = torch.device("cuda")
    # else:
    #    print("CUDA not available, using CPU.")
    #    device = torch.device("cpu")


    model = UNet(n_channels=3, n_classes=1).to(device)

    # Create a dummy input tensor
    # Batch size of 1, 3 channels, 256x256 image
    dummy_input = torch.randn(1, 3, 256, 256).to(device)

    print(f"Input shape: {dummy_input.shape}")

    # Forward pass
    try:
        output = model(dummy_input)
        print(f"Output shape: {output.shape}")
        # For segmentation, output shape should be (batch_size, n_classes, height, width)
        # For classification (if U-Net adapted), it might be (batch_size, n_classes)
        assert output.shape == (1, 1, 256, 256) # Example assertion for segmentation
        print("UNet model created and test forward pass successful!")

    except Exception as e:
        print(f"Error during model forward pass: {e}")

    # Print model summary (optional, requires torchsummary)
    # try:
    #     from torchsummary import summary
    #     summary(model, input_size=(3, 256, 256))
    # except ImportError:
    #     print("torchsummary not installed. Skipping model summary.")
    #     print(model)
    # except Exception as e:
    #     print(f"Error printing model summary: {e}")

    # Example with different number of channels and classes
    # model_multichannel = UNet(n_channels=13, n_classes=5, bilinear=True).to(device) # Example for GOES data
    # dummy_input_mc = torch.randn(1, 13, 512, 512).to(device)
    # output_mc = model_multichannel(dummy_input_mc)
    # print(f"Multichannel input shape: {dummy_input_mc.shape}, output shape: {output_mc.shape}")

    # Check parameter count
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total trainable parameters: {total_params:,}")
