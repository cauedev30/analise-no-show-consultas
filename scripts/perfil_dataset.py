import sys
import pandas as pd

df = pd.read_csv(sys.argv[1])
print("linhas, colunas:", df.shape)
print("colunas:", list(df.columns))
print(df.dtypes.to_string())
print("\nnulos por coluna:", int(df.isna().sum().sum()))
print("linhas duplicadas:", int(df.duplicated().sum()))
print("pacientes unicos:", df["PatientId"].nunique())
print("\nNo-show:", df["No-show"].value_counts().to_dict())
print("taxa de falta (Yes):", round((df["No-show"] == "Yes").mean() * 100, 2), "%")
print("\nidade min/max:", df["Age"].min(), df["Age"].max(), "| idade < 0:", int((df["Age"] < 0).sum()))
for c in ["Scholarship", "Hipertension", "Diabetes", "Alcoholism", "Handcap", "SMS_received"]:
    print(c, sorted(df[c].unique().tolist()))
print("Gender:", df["Gender"].value_counts().to_dict())
s = pd.to_datetime(df["ScheduledDay"])
a = pd.to_datetime(df["AppointmentDay"])
print("\nScheduledDay:", s.min(), "->", s.max())
print("AppointmentDay:", a.min(), "->", a.max())
espera = (a.dt.normalize() - s.dt.normalize()).dt.days
print("espera negativa (consulta antes do agendamento):", int((espera < 0).sum()))
print("AppointmentDay com hora diferente de 00:00:", int((a.dt.hour != 0).sum()))
print("bairros distintos:", df["Neighbourhood"].nunique())
print("\nexemplo:\n", df.head(2).T.to_string())
