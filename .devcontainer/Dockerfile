FROM mcr.microsoft.com/devcontainers/java
RUN wget -O - https://dathere.github.io/qsv-deb-releases/qsv-deb.gpg | gpg --dearmor -o /usr/share/keyrings/qsv-deb.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/qsv-deb.gpg] https://dathere.github.io/qsv-deb-releases ./" | tee /etc/apt/sources.list.d/qsv.list
RUN apt update
RUN apt install -y qsv swi-prolog
