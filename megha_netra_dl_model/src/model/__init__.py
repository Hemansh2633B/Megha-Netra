# Model architecture definitions for Megha Netra.

# from .unet import UNet # Example if UNet is in unet.py
# from .custom_cnn import CustomCNN # Example for another model type

from .unet import UNet
from .fusion_architecture import MultiSensorFusionArchitecture
from .weather_transformer import Weather4DTransformer
from .sensor_pathways import SatellitePathwayNetwork
from .attention_gating import AttentionBasedSensorGating
from .neural_memory import NeurologicalWeatherMemory
from .diffusion_models import CausalWeatherDiffusion
from .spherical_cnn import TopologyAwareConvolutions
from .uncertainty_models import UncertaintyWeightedTraining
from .contrastive_learning import CrossSensorContrastiveLearning
from .physics_augmentation import PhysicsInformedDataAugmentation
from .dynamic_sampling import DynamicSpatiotemporalSampling
from .extreme_weather import ExtremeWeatherSpecialization
from .topographic_intelligence import TopographicIntelligence
from .satellite_synergy import NextGenSatelliteSynergy
from .climate_adaptations import ClimateCrisisAdaptations
from .temporal_dynamics import TemporalDynamicsModels
from .ocean_atmosphere import OceanAtmosphereCoupling
from .cognitive_architecture import CognitiveWeatherArchitecture
from .global_integration import GlobalSystemIntegration
from .micro_models import OnDeviceMicroModels
from .computation_routing import DynamicComputationRouting
from .quantization import SatelliteSpecificQuantization

__all__ = [
    'UNet',
    'MultiSensorFusionArchitecture',
    'Weather4DTransformer',
    'SatellitePathwayNetwork',
    'AttentionBasedSensorGating',
    'NeurologicalWeatherMemory',
    'CausalWeatherDiffusion',
    'TopologyAwareConvolutions',
    'UncertaintyWeightedTraining',
    'CrossSensorContrastiveLearning',
    'PhysicsInformedDataAugmentation',
    'DynamicSpatiotemporalSampling',
    'ExtremeWeatherSpecialization',
    'TopographicIntelligence',
    'NextGenSatelliteSynergy',
    'ClimateCrisisAdaptations',
    'TemporalDynamicsModels',
    'OceanAtmosphereCoupling',
    'CognitiveWeatherArchitecture',
    'GlobalSystemIntegration',
    'OnDeviceMicroModels',
    'DynamicComputationRouting',
    'SatelliteSpecificQuantization'
]
