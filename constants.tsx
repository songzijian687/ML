
import React from 'react';
import { 
  Sun, 
  Moon, 
  Cloud, 
  Zap, 
  Sparkles, 
  Wand2, 
  Hammer, 
  Droplets, 
  Box, 
  Grid, 
  Waves,
  Feather,
  Camera,
  Ghost,
  Palette,
  BrickWall,
  Layers as LayersIcon,
  CircleDot
} from 'lucide-react';
import { LightingProfile, RepairOption, TextureOption } from './types';

export interface QuickEdit {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export const LIGHTING_PROFILES: LightingProfile[] = [
  {
    id: 'deep-moonlight',
    name: '深邃月夜',
    description: '深蓝色的月光氛围，建筑内部透出温暖的灯光。',
    prompt: 'Transform the scene into a realistic night view. Use deep blue moonlight for the exterior, and turn on warm interior lights. Create realistic nocturnal reflections.',
    icon: 'Moon'
  },
  {
    id: 'golden-hour',
    name: '黄金时刻',
    description: '温暖的低角度阳光，带有柔长的电影感阴影。',
    prompt: 'Adjust the lighting to a warm golden hour setting. Enhance warm highlights and create long, soft cinematic shadows.',
    icon: 'Sun'
  },
  {
    id: 'neutral-daylight',
    name: '中性日光',
    description: '平衡且清晰的标准白昼日光效果。',
    prompt: 'Correct the lighting to a neutral, studio-quality daylight. Balance the white point.',
    icon: 'Sparkles'
  }
];

export const REPAIR_OPTIONS: RepairOption[] = [
  {
    id: 'denoise',
    label: '画质去噪',
    prompt: 'Reduce render noise and grain while preserving sharp edges.'
  },
  {
    id: 'upscale',
    label: '细节重构',
    prompt: 'Intelligently add realistic micro-details to the surfaces and geometry for a higher-fidelity look.'
  }
];

export const TEXTURE_OPTIONS: TextureOption[] = [
  {
    id: 'marble',
    label: '爵士白大理石',
    prompt: 'Identify all stone surfaces and replace them with premium Volakas marble texture, featuring elegant grey veins and a polished finish.',
    icon: 'Grid'
  },
  {
    id: 'walnut',
    label: '北美黑胡桃',
    prompt: 'Identify all wooden elements and replace their textures with high-end North American Black Walnut wood grain, semi-gloss finish.',
    icon: 'Box'
  },
  {
    id: 'concrete',
    label: '清水混凝土',
    prompt: 'Transform the wall surfaces into smooth, architectural-grade fair-faced concrete with subtle formwork patterns.',
    icon: 'LayersIcon'
  },
  {
    id: 'brass',
    label: '拉丝黄铜',
    prompt: 'Identify metallic components and replace them with sophisticated brushed brass texture, including realistic anisotropic highlights.',
    icon: 'CircleDot'
  },
  {
    id: 'velvet',
    label: '丝绒布艺',
    prompt: 'Identify fabric surfaces (sofas, curtains) and replace them with luxurious heavy velvet texture in a neutral tone.',
    icon: 'Feather'
  },
  {
    id: 'terrazzo',
    label: '极简磨石子',
    prompt: 'Replace the flooring with modern fine-grained white terrazzo texture containing subtle grey and beige aggregates.',
    icon: 'BrickWall'
  }
];

export const QUICK_EDITS: QuickEdit[] = [
  {
    id: 'remove-ppl',
    label: '一键路人消除',
    prompt: 'Automatically identify and remove any people or clutter from the scene, seamlessly reconstructing the background.',
    icon: 'Ghost'
  },
  {
    id: 'add-plants',
    label: '增加室内绿植',
    prompt: 'Artfully place a few realistic high-quality indoor plants in appropriate corners to enhance the space vitality.',
    icon: 'Droplets'
  }
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  Sun: <Sun className="w-4 h-4" />,
  Moon: <Moon className="w-4 h-4" />,
  Cloud: <Cloud className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Wand2: <Wand2 className="w-4 h-4" />,
  Hammer: <Hammer className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
  Box: <Box className="w-4 h-4" />,
  Waves: <Waves className="w-4 h-4" />,
  Feather: <Feather className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  Ghost: <Ghost className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  BrickWall: <BrickWall className="w-4 h-4" />,
  LayersIcon: <LayersIcon className="w-4 h-4" />,
  CircleDot: <CircleDot className="w-4 h-4" />
};
