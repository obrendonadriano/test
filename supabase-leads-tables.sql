create extension if not exists pgcrypto;

create table if not exists public.leads_veiculo (
  id uuid primary key default gen_random_uuid(),
  nome text not null default '',
  cpf text not null default '',
  telefone text not null default '',
  data_nascimento date,
  placa text not null default '',
  ano integer not null default 0,
  valor_desejado numeric not null default 0,
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

create table if not exists public.leads_imovel (
  id uuid primary key default gen_random_uuid(),
  nome text not null default '',
  cpf text not null default '',
  telefone text not null default '',
  data_nascimento date,
  placa text not null default '',
  ano integer not null default 0,
  valor_desejado numeric not null default 0,
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

create index if not exists leads_veiculo_created_at_idx on public.leads_veiculo (created_at desc);
create index if not exists leads_imovel_created_at_idx on public.leads_imovel (created_at desc);

do $$
begin
  if to_regclass('public.leads_financiamento') is not null then
    insert into public.leads_veiculo (
      id, nome, cpf, telefone, data_nascimento, placa, ano, valor_desejado, status, created_at
    )
    select
      id,
      coalesce(nome, ''),
      coalesce(cpf, ''),
      coalesce(telefone, ''),
      data_nascimento,
      coalesce(placa, ''),
      coalesce(ano, 0),
      coalesce(valor_desejado, 0),
      coalesce(status, 'Novo'),
      created_at
    from public.leads_financiamento
    where placa is null or placa not like 'IMOVEL-%'
    on conflict (id) do nothing;

    insert into public.leads_imovel (
      id, nome, cpf, telefone, data_nascimento, placa, ano, valor_desejado, status, created_at
    )
    select
      id,
      coalesce(nome, ''),
      coalesce(cpf, ''),
      coalesce(telefone, ''),
      data_nascimento,
      coalesce(placa, ''),
      coalesce(ano, 0),
      coalesce(valor_desejado, 0),
      coalesce(status, 'Novo'),
      created_at
    from public.leads_financiamento
    where placa like 'IMOVEL-%'
    on conflict (id) do nothing;
  end if;
end $$;
