## Removing some files
rm -rf youtube-dl
rm -rf .env

## setup dependencies of npm
npm install

## setup animelover1984/youtube-dl
git clone https://github.com/animelover1984/youtube-dl
cd youtube-dl
pip install -r requirements.txt
pip install python-dateutil

# Copy env files
cd ../
cp .env.example .env

echo 'Setup is done, please move to next step in README.'
read -p "Press enter to exit"

