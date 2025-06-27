import tensorflow as tf
from tensorflow.keras.layers import (Input, Conv2D, DepthwiseConv2D, GlobalAvgPool2D, 
                                    Dense, Dropout, BatchNormalization, MultiHeadAttention,
                                    LayerNormalization, Embedding, Bidirectional, LSTM,
                                    Concatenate, Add, Activation)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import AdamW

def MeghaNetra(
        image_shape=(256, 256, 3),
        num_classes=1000,
        text_vocab_size=50000,
        text_seq_len=128,
        num_heads=8,
        embed_dim=128,
        lstm_units=256
    ):
    """Enhanced Megha Netra - Unified Vision-Language Model"""
    
    # ====== Computer Vision Branch ======
    vision_input = Input(shape=image_shape, name='vision_input')
    
    # Hybrid EfficientNet/MobileNetV3 stem
    x = Conv2D(32, (3,3), strides=2, padding='same', activation='swish')(vision_input)
    x = BatchNormalization()(x)
    
    # MobileNet-style blocks
    for filters in [64, 128, 256]:
        # Depthwise separable convolution
        x = DepthwiseConv2D((3,3), padding='same')(x)
        x = BatchNormalization()(x)
        x = Activation('swish')(x)
        x = Conv2D(filters, (1,1), activation='swish')(x)
        x = MaxPooling2D((2,2))(x)
    
    vision_output = GlobalAvgPool2D(name='vision_output')(x)
    
    # ====== NLP Branch ======
    text_input = Input(shape=(text_seq_len,), name='text_input')
    
    # Transformer Encoder
    x = Embedding(text_vocab_size, embed_dim)(text_input)
    x = MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim//num_heads)(x, x)
    x = LayerNormalization()(x)
    
    # Bidirectional LSTM
    text_output = Bidirectional(LSTM(lstm_units))(x)
    
    # ====== Multimodal Fusion ======
    fused = Concatenate()([vision_output, text_output])
    
    # Dual activation pathway
    x_relu = Dense(512, activation='relu')(fused)
    x_gelu = Dense(512, activation='gelu')(fused)
    x = Add()([x_relu, x_gelu])
    x = Dropout(0.5)(x)
    
    # Output
    outputs = Dense(num_classes, activation='softmax')(x)
    
    # ====== Model Assembly ======
    model = Model(
        inputs=[vision_input, text_input],
        outputs=outputs,
        name='MeghaNetra'
    )
    
    model.compile(
        optimizer=AdamW(learning_rate=3e-5),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# Create the model
megha_netra = MeghaNetra()
megha_netra.summary()