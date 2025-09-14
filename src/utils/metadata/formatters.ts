
// Helper function to format GPS coordinates
export const formatGPS = (gps: any) => {
  if (!gps || !gps.latitude || !gps.longitude) return 'Not available';
  return `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`;
};

// Helper function to format date
export const formatDate = (date: Date | undefined) => {
  if (!date) return 'Not available';
  return date.toLocaleString();
};

// Helper function to calculate aspect ratio
export const calculateAspectRatio = (width: number, height: number): string => {
  if (!width || !height) return 'Unknown';
  
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

// Format flash data
export const formatFlashData = (flash: any): string => {
  if (flash === undefined) return 'Unknown';
  
  // Handle numeric flash values
  if (typeof flash === 'number') {
    const flashFired = (flash & 0x1) !== 0;
    const flashReturn = (flash & 0x6) >> 1;
    const flashMode = (flash & 0x18) >> 3;
    const flashFunction = (flash & 0x20) !== 0;
    const redEyeReduction = (flash & 0x40) !== 0;
    
    let result = flashFired ? 'Fired' : 'Did not fire';
    
    if (flashReturn === 2) result += ', light not detected';
    if (flashReturn === 3) result += ', light detected';
    
    if (flashMode === 1) result += ', compulsory flash';
    if (flashMode === 2) result += ', compulsory flash suppression';
    if (flashMode === 3) result += ', auto mode';
    
    if (flashFunction) result += ', no flash function';
    if (redEyeReduction) result += ', red-eye reduction';
    
    return result;
  }
  
  return flash ? 'On' : 'Off';
};

// Format exposure mode
export const formatExposureMode = (mode: number): string => {
  if (mode === undefined) return 'Unknown';
  
  const modes: { [key: number]: string } = {
    0: 'Auto',
    1: 'Manual',
    2: 'Auto bracket'
  };
  
  return modes[mode] || `Unknown (${mode})`;
};

// Format exposure program
export const formatExposureProgram = (program: number): string => {
  if (program === undefined) return 'Unknown';
  
  const programs: { [key: number]: string } = {
    0: 'Not defined',
    1: 'Manual',
    2: 'Normal program',
    3: 'Aperture priority',
    4: 'Shutter priority',
    5: 'Creative program',
    6: 'Action program',
    7: 'Portrait mode',
    8: 'Landscape mode'
  };
  
  return programs[program] || `Unknown (${program})`;
};

// Format metering mode
export const formatMeteringMode = (mode: number): string => {
  if (mode === undefined) return 'Unknown';
  
  const modes: { [key: number]: string } = {
    0: 'Unknown',
    1: 'Average',
    2: 'Center weighted average',
    3: 'Spot',
    4: 'Multi Spot',
    5: 'Pattern',
    6: 'Partial',
    255: 'Other'
  };
  
  return modes[mode] || `Unknown (${mode})`;
};

// Format white balance
export const formatWhiteBalance = (wb: number): string => {
  if (wb === undefined) return 'Unknown';
  
  const modes: { [key: number]: string } = {
    0: 'Auto',
    1: 'Manual'
  };
  
  return modes[wb] || `Unknown (${wb})`;
};

// Format scene capture type
export const formatSceneCaptureType = (type: number): string => {
  if (type === undefined) return 'Unknown';
  
  const types: { [key: number]: string } = {
    0: 'Standard',
    1: 'Landscape',
    2: 'Portrait',
    3: 'Night Scene'
  };
  
  return types[type] || `Unknown (${type})`;
};

// Format color space
export const formatColorSpace = (colorSpace: number): string => {
  if (colorSpace === undefined) return 'Unknown';
  
  const spaces: { [key: number]: string } = {
    1: 'sRGB',
    2: 'Adobe RGB',
    65535: 'Uncalibrated'
  };
  
  return spaces[colorSpace] || `Unknown (${colorSpace})`;
};

// Format color mode
export const formatColorMode = (mode: number | string): string => {
  if (mode === undefined) return 'Unknown';
  
  if (typeof mode === 'number') {
    const modes: { [key: number]: string } = {
      0: 'RGB',
      1: 'Indexed',
      2: 'Grayscale',
      3: 'CMYK',
      4: 'Multichannel',
      7: 'Lab',
      8: 'Duotone',
      9: 'Bitmap'
    };
    return modes[mode] || `Unknown (${mode})`;
  }
  
  return mode.toString();
};

// Format compression
export const formatCompression = (compression: number): string => {
  if (compression === undefined) return 'Unknown';
  
  const compressions: { [key: number]: string } = {
    1: 'Uncompressed',
    2: 'CCITT 1D',
    3: 'T4/Group 3 Fax',
    4: 'T6/Group 4 Fax',
    5: 'LZW',
    6: 'JPEG (old style)',
    7: 'JPEG',
    8: 'Adobe Deflate',
    9: 'JBIG B&W',
    10: 'JBIG Color',
    99: 'JPEG',
    262: 'Kodak 262',
    32766: 'Next',
    32767: 'Sony ARW Compressed',
    32769: 'Packed RAW',
    32770: 'Samsung SRW Compressed',
    32771: 'CCIRLEW',
    32773: 'PackBits',
    32809: 'Thunderscan',
    32867: 'Kodak KDC Compressed',
    32895: 'IT8CTPAD',
    32896: 'IT8LW',
    32897: 'IT8MP',
    32898: 'IT8BL',
    32908: 'PixarFilm',
    32909: 'PixarLog',
    32946: 'Deflate',
    32947: 'DCS',
    34661: 'JBIG',
    34676: 'SGILog',
    34677: 'SGILog24',
    34712: 'JPEG 2000',
    34713: 'Nikon NEF Compressed',
    34715: 'JBIG2 TIFF FX',
    34718: 'Microsoft Document Imaging (MDI) Binary Level Codec',
    34719: 'Microsoft Document Imaging (MDI) Progressive Transform Codec',
    34720: 'Microsoft Document Imaging (MDI) Vector',
    34892: 'Lossy JPEG',
    65000: 'Kodak DCR Compressed',
    65535: 'Pentax PEF Compressed'
  };
  
  return compressions[compression] || `Unknown (${compression})`;
};

// Format resolution unit
export const formatResolutionUnit = (unit: number): string => {
  if (unit === undefined) return 'Unknown';
  
  const units: { [key: number]: string } = {
    1: 'None',
    2: 'Inches',
    3: 'Centimeters'
  };
  
  return units[unit] || `Unknown (${unit})`;
};

// Format YCbCr Positioning
export const formatYCbCrPositioning = (pos: number): string => {
  if (pos === undefined) return 'Unknown';
  
  const positions: { [key: number]: string } = {
    1: 'Centered',
    2: 'Co-sited'
  };
  
  return positions[pos] || `Unknown (${pos})`;
};

// Format Sharpness
export const formatSharpness = (sharpness: number): string => {
  if (sharpness === undefined) return 'Unknown';
  
  const sharpnessValues: { [key: number]: string } = {
    0: 'Normal',
    1: 'Soft',
    2: 'Hard'
  };
  
  return sharpnessValues[sharpness] || `Unknown (${sharpness})`;
};

// Format Contrast
export const formatContrast = (contrast: number): string => {
  if (contrast === undefined) return 'Unknown';
  
  const contrastValues: { [key: number]: string } = {
    0: 'Normal',
    1: 'Soft',
    2: 'Hard'
  };
  
  return contrastValues[contrast] || `Unknown (${contrast})`;
};

// Format Saturation
export const formatSaturation = (saturation: number): string => {
  if (saturation === undefined) return 'Unknown';
  
  const saturationValues: { [key: number]: string } = {
    0: 'Normal',
    1: 'Low saturation',
    2: 'High saturation'
  };
  
  return saturationValues[saturation] || `Unknown (${saturation})`;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
