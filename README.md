## Setup
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Running:
First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Next.js Help

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

## Updating the "Meredith" image collage

### 1. Create new mask
Update the mask in Figma or create a new one in Figma or adobe. All target images should have the same width and height. Download the mask in high resolution (3200px).

### 2. Generate DZI files
The easiest way to generate and integrate the new DZI files is to:
1. Upload the collage as a png
2. (Remove all current DZI associated files?)
3. Pick [this commit](https://github.com/meredithvf/2025-portfolio-website/commit/6be9fabd3cc3641ad32e974d329af3ab73928b1a)
4. Run the script/follow the README in the commit
5. Remove the png as it is not used

### 3. Update target positions
Finding the target image positions is tedious with the DZI setup I have right now.
1. Pick [this commit](https://github.com/meredithvf/2025-portfolio-website/commit/ebeebe95abbb005a60b4517ba86ec80ae4e7e97f)
2. Approximately click the center of the image and update the position with the displayed coordinates
3. Don't forget to delete the helper code
