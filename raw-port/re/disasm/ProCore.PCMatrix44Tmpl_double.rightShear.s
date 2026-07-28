__ZN14PCMatrix44TmplIdE10rightShearEdd:
000000000004f85e	pushq	%rbp
000000000004f85f	movq	%rsp, %rbp
000000000004f862	pushq	%rbx
000000000004f863	subq	$0x28, %rsp
000000000004f867	movapd	%xmm1, %xmm2
000000000004f86b	movapd	%xmm0, %xmm5
000000000004f86f	movq	%rdi, %rbx
000000000004f872	xorpd	%xmm0, %xmm0
000000000004f876	ucomisd	%xmm0, %xmm5
000000000004f87a	jne	0x4f882
000000000004f87c	jnp	0x4f909
000000000004f882	ucomisd	%xmm5, %xmm0
000000000004f886	jbe	0x4f89e
000000000004f888	movsd	0xd2d10(%rip), %xmm0
000000000004f890	xorpd	%xmm1, %xmm1
000000000004f894	addsd	%xmm0, %xmm5
000000000004f898	ucomisd	%xmm5, %xmm1
000000000004f89c	ja	0x4f894
000000000004f89e	ucomisd	0xd2cfa(%rip), %xmm5
000000000004f8a6	movapd	%xmm2, -0x20(%rbp)
000000000004f8ab	jbe	0x4f8c7
000000000004f8ad	movsd	0xd5e5b(%rip), %xmm0
000000000004f8b5	movsd	0xd2ce3(%rip), %xmm1
000000000004f8bd	addsd	%xmm0, %xmm5
000000000004f8c1	ucomisd	%xmm1, %xmm5
000000000004f8c5	ja	0x4f8bd
000000000004f8c7	movapd	%xmm5, %xmm0
000000000004f8cb	cmpltsd	0xd5e44(%rip), %xmm0
000000000004f8d4	movapd	%xmm5, %xmm1
000000000004f8d8	blendvpd	%xmm0, 0xd5e1f(%rip), %xmm1
000000000004f8e1	movsd	0xd5e37(%rip), %xmm0
000000000004f8e9	cmpltsd	%xmm5, %xmm0
000000000004f8ee	blendvpd	%xmm0, %xmm1, %xmm5
000000000004f8f3	movapd	%xmm5, %xmm0
000000000004f8f7	callq	0xdebc4                         ## symbol stub for: _tan
000000000004f8fc	movapd	%xmm0, %xmm5
000000000004f900	movapd	-0x20(%rbp), %xmm2
000000000004f905	xorpd	%xmm0, %xmm0
000000000004f909	ucomisd	%xmm0, %xmm2
000000000004f90d	jne	0x4f911
000000000004f90f	jnp	0x4f990
000000000004f911	ucomisd	%xmm2, %xmm0
000000000004f915	jbe	0x4f929
000000000004f917	movsd	0xd2c81(%rip), %xmm1
000000000004f91f	addsd	%xmm1, %xmm2
000000000004f923	ucomisd	%xmm2, %xmm0
000000000004f927	ja	0x4f91f
000000000004f929	ucomisd	0xd2c6f(%rip), %xmm2
000000000004f931	movapd	%xmm5, -0x30(%rbp)
000000000004f936	jbe	0x4f952
000000000004f938	movsd	0xd5dd0(%rip), %xmm0
000000000004f940	movsd	0xd2c58(%rip), %xmm1
000000000004f948	addsd	%xmm0, %xmm2
000000000004f94c	ucomisd	%xmm1, %xmm2
000000000004f950	ja	0x4f948
000000000004f952	movapd	%xmm2, %xmm0
000000000004f956	cmpltsd	0xd5db9(%rip), %xmm0
000000000004f95f	movapd	%xmm2, %xmm1
000000000004f963	blendvpd	%xmm0, 0xd5d94(%rip), %xmm1
000000000004f96c	movsd	0xd5dac(%rip), %xmm0
000000000004f974	cmpltsd	%xmm2, %xmm0
000000000004f979	blendvpd	%xmm0, %xmm1, %xmm2
000000000004f97e	movapd	%xmm2, %xmm0
000000000004f982	callq	0xdebc4                         ## symbol stub for: _tan
000000000004f987	movapd	%xmm0, %xmm2
000000000004f98b	movapd	-0x30(%rbp), %xmm5
000000000004f990	unpcklpd	%xmm2, %xmm5                    ## xmm5 = xmm5[0],xmm2[0]
000000000004f994	movupd	(%rbx), %xmm0
000000000004f998	movupd	0x20(%rbx), %xmm1
000000000004f99d	movupd	0x40(%rbx), %xmm2
000000000004f9a2	movupd	0x60(%rbx), %xmm3
000000000004f9a7	movapd	%xmm5, %xmm4
000000000004f9ab	mulpd	%xmm0, %xmm4
000000000004f9af	shufpd	$0x1, %xmm4, %xmm4              ## xmm4 = xmm4[1,0]
000000000004f9b4	addpd	%xmm0, %xmm4
000000000004f9b8	movupd	%xmm4, (%rbx)
000000000004f9bc	movapd	%xmm5, %xmm0
000000000004f9c0	mulpd	%xmm1, %xmm0
000000000004f9c4	shufpd	$0x1, %xmm0, %xmm0              ## xmm0 = xmm0[1,0]
000000000004f9c9	addpd	%xmm1, %xmm0
000000000004f9cd	movupd	%xmm0, 0x20(%rbx)
000000000004f9d2	movapd	%xmm5, %xmm0
000000000004f9d6	mulpd	%xmm2, %xmm0
000000000004f9da	shufpd	$0x1, %xmm0, %xmm0              ## xmm0 = xmm0[1,0]
000000000004f9df	addpd	%xmm2, %xmm0
000000000004f9e3	movupd	%xmm0, 0x40(%rbx)
000000000004f9e8	mulpd	%xmm3, %xmm5
000000000004f9ec	shufpd	$0x1, %xmm5, %xmm5              ## xmm5 = xmm5[1,0]
000000000004f9f1	addpd	%xmm3, %xmm5
000000000004f9f5	movupd	%xmm5, 0x60(%rbx)
000000000004f9fa	addq	$0x28, %rsp
000000000004f9fe	popq	%rbx
000000000004f9ff	popq	%rbp
000000000004fa00	retq
