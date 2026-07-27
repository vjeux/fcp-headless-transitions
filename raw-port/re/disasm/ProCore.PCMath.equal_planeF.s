__ZN6PCMath5equalERK7PCPlaneIfES3_f:
0000000000067308	pushq	%rbp
0000000000067309	movq	%rsp, %rbp
000000000006730c	movaps	%xmm0, %xmm1
000000000006730f	movsd	0xc(%rdi), %xmm2
0000000000067314	movss	0x14(%rdi), %xmm3
0000000000067319	movss	0x14(%rsi), %xmm4
000000000006731e	movsd	0xc(%rsi), %xmm6
0000000000067323	movss	0x10(%rsi), %xmm5
0000000000067328	movaps	%xmm2, %xmm0
000000000006732b	insertps	$0x1c, %xmm6, %xmm0             ## xmm0 = xmm0[0],xmm6[0],zero,zero
0000000000067331	mulps	%xmm0, %xmm0
0000000000067334	movaps	%xmm6, %xmm7
0000000000067337	insertps	$0x4c, %xmm2, %xmm7             ## xmm7 = xmm2[1],xmm7[1],zero,zero
000000000006733d	mulps	%xmm7, %xmm7
0000000000067340	addps	%xmm0, %xmm7
0000000000067343	movaps	%xmm3, %xmm0
0000000000067346	insertps	$0x10, %xmm4, %xmm0             ## xmm0 = xmm0[0],xmm4[0],xmm0[2,3]
000000000006734c	mulps	%xmm0, %xmm0
000000000006734f	addps	%xmm7, %xmm0
0000000000067352	movshdup	%xmm0, %xmm7                    ## xmm7 = xmm0[1,1,3,3]
0000000000067356	divss	%xmm7, %xmm0
000000000006735a	movaps	%xmm6, %xmm8
000000000006735e	insertps	$0x10, %xmm5, %xmm8             ## xmm8 = xmm8[0],xmm5[0],xmm8[2,3]
0000000000067365	mulps	%xmm2, %xmm8
0000000000067369	haddps	%xmm8, %xmm8
000000000006736e	xorps	%xmm7, %xmm7
0000000000067371	sqrtss	%xmm0, %xmm7
0000000000067375	movaps	%xmm3, %xmm0
0000000000067378	mulss	%xmm4, %xmm0
000000000006737c	addss	%xmm8, %xmm0
0000000000067381	movaps	0x7acd7(%rip), %xmm8
0000000000067389	xorps	%xmm7, %xmm8
000000000006738d	xorps	%xmm9, %xmm9
0000000000067391	cmpltss	%xmm9, %xmm0
0000000000067397	blendvps	%xmm0, %xmm8, %xmm7
000000000006739d	mulss	%xmm7, %xmm6
00000000000673a1	movaps	%xmm2, %xmm8
00000000000673a5	subss	%xmm6, %xmm8
00000000000673aa	andps	0x7a7fe(%rip), %xmm8
00000000000673b2	movss	0x7ac46(%rip), %xmm0
00000000000673ba	ucomiss	%xmm8, %xmm0
00000000000673be	jbe	0x673ef
00000000000673c0	mulss	%xmm7, %xmm5
00000000000673c4	movshdup	%xmm2, %xmm6                    ## xmm6 = xmm2[1,1,3,3]
00000000000673c8	subss	%xmm5, %xmm6
00000000000673cc	andps	0x7a7dd(%rip), %xmm6
00000000000673d3	ucomiss	%xmm6, %xmm0
00000000000673d6	jbe	0x673ef
00000000000673d8	mulss	%xmm7, %xmm4
00000000000673dc	movaps	%xmm3, %xmm5
00000000000673df	subss	%xmm4, %xmm5
00000000000673e3	andps	0x7a7c6(%rip), %xmm5
00000000000673ea	ucomiss	%xmm5, %xmm0
00000000000673ed	ja	0x673f3
00000000000673ef	xorl	%eax, %eax
00000000000673f1	popq	%rbp
00000000000673f2	retq
00000000000673f3	movsd	(%rdi), %xmm5
00000000000673f7	movsd	(%rsi), %xmm4
00000000000673fb	movaps	%xmm5, %xmm6
00000000000673fe	subss	%xmm4, %xmm6
0000000000067402	andps	0x7a7a7(%rip), %xmm6
0000000000067409	ucomiss	%xmm6, %xmm0
000000000006740c	jbe	0x6743c
000000000006740e	movss	0x4(%rdi), %xmm6
0000000000067413	subss	0x4(%rsi), %xmm6
0000000000067418	andps	0x7a791(%rip), %xmm6
000000000006741f	ucomiss	%xmm6, %xmm0
0000000000067422	jbe	0x6743c
0000000000067424	movss	0x8(%rdi), %xmm6
0000000000067429	subss	0x8(%rsi), %xmm6
000000000006742e	andps	0x7a77b(%rip), %xmm6
0000000000067435	movb	$0x1, %al
0000000000067437	ucomiss	%xmm6, %xmm0
000000000006743a	ja	0x673f1
000000000006743c	movaps	%xmm5, %xmm0
000000000006743f	blendps	$0x2, %xmm4, %xmm0              ## xmm0 = xmm0[0],xmm4[1],xmm0[2,3]
0000000000067445	mulps	%xmm2, %xmm0
0000000000067448	blendps	$0x2, %xmm5, %xmm4              ## xmm4 = xmm4[0],xmm5[1],xmm4[2,3]
000000000006744e	shufps	$0xe1, %xmm4, %xmm4             ## xmm4 = xmm4[1,0,2,3]
0000000000067452	shufps	$0xe1, %xmm2, %xmm2             ## xmm2 = xmm2[1,0,2,3]
0000000000067456	mulps	%xmm4, %xmm2
0000000000067459	addps	%xmm0, %xmm2
000000000006745c	movups	0x8(%rdi), %xmm0
0000000000067460	movsldup	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,2,2]
0000000000067464	insertps	$0x10, 0x8(%rsi), %xmm0         ## xmm0 = xmm0[0],mem[0],xmm0[2,3]
000000000006746b	mulps	%xmm3, %xmm0
000000000006746e	addps	%xmm2, %xmm0
0000000000067471	hsubps	%xmm0, %xmm0
0000000000067475	andps	0x7a734(%rip), %xmm0
000000000006747c	ucomiss	%xmm0, %xmm1
000000000006747f	seta	%al
0000000000067482	jmp	0x673f1
