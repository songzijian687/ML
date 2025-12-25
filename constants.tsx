
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
  CircleDot,
  Globe,
  ImagePlus,
  Disc,
  Target,
  Minus,
  Lightbulb
} from 'lucide-react';
import { LightingProfile, RepairOption, FixtureOption } from './types';

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
    prompt: 'Reduce render noise and grain while preserving sharp edges.',
    icon: 'Waves'
  },
  {
    id: 'upscale',
    label: '细节重构',
    prompt: 'Intelligently add realistic micro-details to the surfaces and geometry for a higher-fidelity look.',
    icon: 'Wand2'
  }
];

export const FIXTURE_OPTIONS: FixtureOption[] = [
  {
    id: 'downlight',
    label: '嵌入式筒灯',
    prompt: 'Install realistic recessed downlights in the ceiling, arranged in a logical architectural grid pattern. Ensure they cast natural downward cones of light.',
    icon: 'Disc'
  },
  {
    id: 'spotlight',
    label: '重点射灯',
    prompt: 'Add adjustable track spotlights or directional recessed spots to highlight key furniture, artwork, or wall textures with focused beams.',
    icon: 'Target'
  },
  {
    id: 'light-strip',
    label: '线性灯带',
    prompt: 'Install concealed LED light strips (cove lighting) along ceiling edges, under cabinets, or behind mirrors to create a soft, modern ambient glow.',
    icon: 'Minus'
  },
  {
    id: 'pendant',
    label: '艺术吊灯',
    prompt: 'Hang a stylish modern pendant light fixture in the center of the space or over key areas like tables.',
    icon: 'Lightbulb'
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
  CircleDot: <CircleDot className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  ImagePlus: <ImagePlus className="w-4 h-4" />,
  Disc: <Disc className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  Minus: <Minus className="w-4 h-4" />,
  Lightbulb: <Lightbulb className="w-4 h-4" />
};
