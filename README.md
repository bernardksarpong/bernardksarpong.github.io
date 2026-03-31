# Bernard Kofi Sarpong Academic Website

This repository contains a lightweight GitHub Pages website built with plain HTML, CSS, and Jekyll-compatible YAML data files. The layout is intentionally simple so the site can be updated later in GitHub's browser editor without needing a local development setup.

## Repository Structure

- `_config.yml` - Site settings for GitHub Pages / Jekyll
- `_data/profile.yml` - Homepage profile content, education, research fields, and interests
- `_data/research.yml` - Research overview, methods, and research agenda
- `_data/experience.yml` - Teaching, professional experience, service, skills, and languages
- `_data/publications.yml` - Publications and working papers
- `_data/contact.yml` - Contact details and profile links
- `_layouts/default.html` - Shared page layout and top navigation
- `assets/css/style.css` - Site styling
- `assets/img/profile.jpg` - Replaceable profile photo
- `assets/files/Bernard_Sarpong_CV.pdf` - Replaceable CV PDF
- `index.html` - Home page
- `research.html` - Research page
- `experience.html` - Teaching & Experience page
- `publications.html` - Publications page
- `cv.html` - CV page
- `contact.html` - Contact page

## How To Edit Content

Most text on the site lives in the YAML files inside `_data/`.

1. Open the repository on GitHub.
2. Open the file you want to update.
3. Click the pencil icon to edit it in the browser.
4. Make your changes.
5. Commit the changes.
6. Wait a minute or two for GitHub Pages to publish the update.

## Which File Controls What

- Edit `_data/profile.yml` to update the name, biography, education, research fields, and research interests.
- Edit `_data/research.yml` to update the research overview, current questions, methods, and Google Scholar entry.
- Edit `_data/experience.yml` to update teaching roles, professional positions, conference coordination, referee service, skills, and languages.
- Edit `_data/publications.yml` to add published work or working papers.
- Edit `_data/contact.yml` to update location, email, WhatsApp, and Google Scholar link details.

## Replace The Profile Photo

1. Upload a new image to `assets/img/profile.jpg`.
2. If you use a different file name, also update `profile_image` in `_data/profile.yml`.

Recommended image style:

- Portrait orientation
- Roughly 800 x 1000 pixels or larger
- Simple headshot with a clean crop

## Replace The CV PDF

1. Upload the latest CV to `assets/files/Bernard_Sarpong_CV.pdf`.
2. If you change the file name, also update `cv_file` in `_data/profile.yml`.

## Add Publications Or Working Papers

Open `_data/publications.yml` and add a new item under `published_work` or `working_papers`.

Example:

```yml
working_papers:
  - authors: Sarpong, B. & Example, A.
    year: "2027"
    title: Example Paper Title
    status: Under review.
```

## Add Or Edit Experience Entries

Each role in `_data/experience.yml` can include a `highlights` list.

Example:

```yml
teaching_experience:
  - role: Example Role
    institution: Example University
    location: Example City
    dates: Jan 2025 - Dec 2025
    highlights:
      - First accomplishment or responsibility.
      - Second accomplishment or responsibility.
```

Skills are grouped under `skill_groups` so they are easy to edit without touching the HTML templates.

## GitHub Pages Publishing

If GitHub Pages is not already enabled for the repository:

1. Go to `Settings`.
2. Click `Pages` in the sidebar.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select the `main` branch and the `/ (root)` folder.
5. Save the settings.

After that, new commits to the publishing branch will trigger a fresh site build automatically.

GitHub's current documentation for publishing from a branch:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll

## YAML Editing Tips

- Keep the indentation exactly as it is. Use 2 spaces for nested items.
- Keep each `-` list item aligned with others in the same section.
- Keep colons in place, for example `title: Example`.
- If the site stops building after an edit, the most common cause is a YAML formatting mistake.

## Optional Local Preview

If someone technical wants to preview the site locally later, they can use Jekyll. This is optional; normal content updates can be done entirely on GitHub in the browser.
