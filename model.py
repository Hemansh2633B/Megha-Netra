import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.models import Sequential

# Fix all random seeds for reproducibility
tf.random.set_seed(42)
np.random.seed(42)

# Define Megha Netra (frozen architecture)
def create_megha_netra(input_shape=(28, 28, 1), num_classes=10):
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=input_shape, name='cloud_eye_1'),
        MaxPooling2D((2, 2), name='cloud_pool_1'),
        Conv2D(64, (3, 3), activation='relu', name='cloud_eye_2'),
        MaxPooling2D((2, 2), name='cloud_pool_2'),
        Flatten(name='sky_flatten'),
        Dense(128, activation='relu', name='sky_mind'),
        Dense(num_classes, activation='softmax', name='cloud_judge')
    ])
    
    # Freeze all weights (no training allowed)
    for layer in model.layers:
        layer.trainable = False
    
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

# Create the immutable model
megha_netra = create_megha_netra()
megha_netra.summary()