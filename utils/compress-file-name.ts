export default function compressFileName(fileName: string): string {
  // Define the maximum length for the substring
  const maxSubstrLength = 18;

  // Check if the fileName is shorter than or equal to the maximum length
  if (fileName.length <= maxSubstrLength) {
    return fileName.trim(); // Return the fileName as is if it's within the limit
  }

  // Extract the extension from the fileName
  const fileExtension = fileName.split(".").pop() || "";

  // Calculate the maximum length for the file name part without extension and ellipsis
  const maxFileNameLength = maxSubstrLength - fileExtension.length - 3;

  // Extract the fileName part (without extension) up to the maximum length
  const fileNameWithoutExtension = fileName.substring(0, maxFileNameLength);

  // Calculate the number of characters to keep in the middle
  const charsToKeep =
    maxSubstrLength -
    fileNameWithoutExtension.length -
    fileExtension.length -
    3;

  // Create the compressed fileName
  const compressedFileName = `${fileNameWithoutExtension}...${fileNameWithoutExtension.slice(
    -charsToKeep,
  )}.${fileExtension}`;

  return compressedFileName;
}
