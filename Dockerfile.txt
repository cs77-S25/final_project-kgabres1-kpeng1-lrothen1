# start by pulling the python image
FROM python:3.10-alpine

# copy every content from the local file to the image
ADD . .

# install the dependencies and packages in the requirements file
RUN pip install -r requirements.txt

CMD ["flask", "run", "--host", "0.0.0.0", "--port", "6000" ]