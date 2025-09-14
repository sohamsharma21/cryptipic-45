import exifr from 'exifr';
import { Metadata } from './types';
import {
  formatGPS, formatDate, calculateAspectRatio, formatFlashData,
  formatExposureMode, formatExposureProgram, formatMeteringMode,
  formatWhiteBalance, formatSceneCaptureType, formatColorSpace,
  formatColorMode, formatCompression, formatResolutionUnit,
  formatYCbCrPositioning, formatSharpness, formatContrast,
  formatSaturation, formatFileSize
} from './formatters';

// Main function to extract metadata from an image file
export const extractMetadata = async (file: File): Promise<Metadata> => {
  try {
    console.log('[Metadata] Extracting metadata from:', file.name, 'Size:', file.size);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }

    // Get all possible metadata with extended options
    const allTags = await exifr.parse(file, { 
      tiff: true, 
      xmp: true, 
      iptc: true, 
      icc: true,
      jfif: true,
      ihdr: true, // For PNG images
      exif: true,
      gps: true,
      makerNote: true,
      userComment: true,
      mergeOutput: true,
      translateKeys: true,
      translateValues: true
    }).catch((error) => {
      console.warn('[Metadata] Partial extraction failed:', error);
      return null;
    });
    
    const gps = await exifr.gps(file).catch(() => {
      console.log('[Metadata] GPS data not available');
      return null;
    });
    
    let metadata: Metadata = {};
    
    // Basic file info
    metadata.fileName = file.name;
    metadata.fileSize = formatFileSize(file.size);
    metadata.fileType = file.type;
    metadata.lastModified = new Date(file.lastModified).toLocaleString();
    
    // Process specific EXIF categories if they exist
    if (allTags) {
      // Camera details
      if (allTags.Make || allTags.Model) {
        metadata.camera = {
          make: allTags.Make || 'Unknown',
          model: allTags.Model || 'Unknown',
          software: allTags.Software || 'Unknown',
          firmware: allTags.FirmwareVersion || allTags.Software || 'Unknown',
          serialNumber: allTags.SerialNumber || 'Unknown',
        };
      }
      
      // Photo details
      if (allTags.DateTimeOriginal || allTags.CreateDate) {
        metadata.photo = {
          dateTaken: formatDate(allTags.DateTimeOriginal || allTags.CreateDate),
          width: allTags.ImageWidth || allTags.ExifImageWidth || 'Unknown',
          height: allTags.ImageHeight || allTags.ExifImageHeight || 'Unknown',
          orientation: allTags.Orientation || 'Unknown',
          aspectRatio: calculateAspectRatio(
            allTags.ImageWidth || allTags.ExifImageWidth, 
            allTags.ImageHeight || allTags.ExifImageHeight
          ),
          bitDepth: allTags.BitDepth || allTags.BitsPerSample || 'Unknown',
        };
      }
      
      // Camera settings
      if (allTags.ISO || allTags.ExposureTime || allTags.FNumber) {
        metadata.settings = {
          iso: allTags.ISO || 'Unknown',
          exposureTime: allTags.ExposureTime ? `${allTags.ExposureTime} sec` : 'Unknown',
          fNumber: allTags.FNumber ? `f/${allTags.FNumber}` : 'Unknown',
          focalLength: allTags.FocalLength ? `${allTags.FocalLength}mm` : 'Unknown',
          focalLengthIn35mmFormat: allTags.FocalLengthIn35mmFormat ? `${allTags.FocalLengthIn35mmFormat}mm` : 'Unknown',
          flash: formatFlashData(allTags.Flash),
          exposureMode: formatExposureMode(allTags.ExposureMode),
          exposureProgram: formatExposureProgram(allTags.ExposureProgram),
          meteringMode: formatMeteringMode(allTags.MeteringMode),
          whiteBalance: formatWhiteBalance(allTags.WhiteBalance),
          exposureBias: allTags.ExposureBias ? `${allTags.ExposureBias} EV` : 'Unknown',
          sceneCaptureType: formatSceneCaptureType(allTags.SceneCaptureType),
        };
      }
      
      // Add any GPS data
      if (gps) {
        metadata.location = {
          coordinates: formatGPS(gps),
          latitude: gps.latitude?.toFixed(6) || 'Unknown',
          longitude: gps.longitude?.toFixed(6) || 'Unknown',
          altitude: gps.altitude ? `${gps.altitude.toFixed(1)}m` : 'Unknown',
          direction: gps.GPSImgDirection ? `${gps.GPSImgDirection}°` : 'Unknown',
          locationName: gps.GPSAreaInformation || 'Unknown',
          datestamp: gps.GPSDateStamp || 'Unknown',
        };
      }
      
      // Copyright/Author information
      if (allTags.Artist || allTags.Copyright || allTags.Creator || allTags.By || allTags.Author) {
        metadata.rights = {
          artist: allTags.Artist || allTags.Creator || allTags.By || allTags.Author || 'Unknown',
          copyright: allTags.Copyright || 'Unknown',
          creatorTool: allTags.CreatorTool || 'Unknown',
          rightsUsageTerms: allTags.UsageTerms || allTags.Rights || 'Unknown',
        };
      }
      
      // Color information
      metadata.color = {
        colorSpace: formatColorSpace(allTags.ColorSpace),
        profileDescription: allTags.ProfileDescription || 'Unknown',
        colorMode: allTags.ColorMode !== undefined ? formatColorMode(allTags.ColorMode) : 'Unknown',
      };
      
      // Lens information
      if (allTags.LensInfo || allTags.LensMake || allTags.LensModel) {
        metadata.lens = {
          make: allTags.LensMake || 'Unknown',
          model: allTags.LensModel || 'Unknown',
          info: allTags.LensInfo || 'Unknown',
          serialNumber: allTags.LensSerialNumber || 'Unknown',
        };
      }

      // IPTC information
      metadata.iptc = {};
      if (allTags.Headline) metadata.iptc.headline = allTags.Headline;
      if (allTags.Caption) metadata.iptc.caption = allTags.Caption;
      if (allTags.Keywords) metadata.iptc.keywords = allTags.Keywords;
      if (allTags.ObjectName) metadata.iptc.title = allTags.ObjectName;
      if (allTags.Category) metadata.iptc.category = allTags.Category;
      if (allTags.SupplementalCategories) metadata.iptc.supplementalCategories = allTags.SupplementalCategories;
      
      // Software information
      metadata.software = {
        processingProgram: allTags.ProcessingSoftware || allTags.Software || 'Unknown',
        historyAction: allTags.HistoryAction || 'Unknown',
        historyChanged: allTags.HistoryChanged || 'Unknown',
      };
      
      // Other interesting data if available
      metadata.advanced = {};
      
      if (allTags.ColorSpace) metadata.advanced.colorSpace = formatColorSpace(allTags.ColorSpace);
      if (allTags.Compression) metadata.advanced.compression = formatCompression(allTags.Compression);
      if (allTags.XResolution) metadata.advanced.xResolution = `${allTags.XResolution} dpi`;
      if (allTags.YResolution) metadata.advanced.yResolution = `${allTags.YResolution} dpi`;
      if (allTags.ResolutionUnit) metadata.advanced.resolutionUnit = formatResolutionUnit(allTags.ResolutionUnit);
      if (allTags.YCbCrPositioning) metadata.advanced.yCbCrPositioning = formatYCbCrPositioning(allTags.YCbCrPositioning);
      if (allTags.Sharpness) metadata.advanced.sharpness = formatSharpness(allTags.Sharpness);
      if (allTags.Contrast) metadata.advanced.contrast = formatContrast(allTags.Contrast);
      if (allTags.Saturation) metadata.advanced.saturation = formatSaturation(allTags.Saturation);
      
      // Add raw data for advanced users
      metadata.rawData = allTags;
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      error: 'Failed to extract metadata from this image.',
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: file.type,
    };
  }
};
