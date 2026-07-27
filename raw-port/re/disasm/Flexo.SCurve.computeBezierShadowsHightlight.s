0000000000062f3d	addb	%al, (%rax)
0000000000062f3f	addb	%dl, 0x48(%rbp)
0000000000062f42	movl	%esp, %ebp
0000000000062f44	pushq	%rbx
0000000000062f45	subq	$0xf8, %rsp
0000000000062f4c	movq	%rdi, %rbx
0000000000062f4f	movsd	%xmm3, -0x70(%rbp)
0000000000062f54	movapd	%xmm0, %xmm5
0000000000062f58	movq	0x188ac69(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000062f5f	movq	(%rax), %rax
0000000000062f62	movq	%rax, -0x10(%rbp)
0000000000062f66	movapd	%xmm0, %xmm4
0000000000062f6a	mulsd	%xmm0, %xmm4
0000000000062f6e	mulsd	0x150a1da(%rip), %xmm4
0000000000062f76	xorpd	%xmm3, %xmm3
0000000000062f7a	cmpltsd	%xmm3, %xmm0
0000000000062f7f	blendvpd	%xmm0, %xmm4, %xmm5
0000000000062f84	movsd	0x150a1cc(%rip), %xmm4
0000000000062f8c	mulsd	%xmm1, %xmm4
0000000000062f90	mulsd	%xmm4, %xmm4
0000000000062f94	ucomisd	%xmm3, %xmm5
0000000000062f98	cmpltsd	%xmm1, %xmm3
0000000000062f9d	movapd	%xmm3, %xmm0
0000000000062fa1	blendvpd	%xmm0, %xmm4, %xmm1
0000000000062fa6	movl	$0x0, (%rsi)
0000000000062fac	jbe	0x62fdd
0000000000062fae	addsd	%xmm5, %xmm5
0000000000062fb2	xorps	%xmm0, %xmm0
0000000000062fb5	cvtsd2ss	%xmm5, %xmm0
0000000000062fb9	movss	%xmm0, (%rsi)
0000000000062fbd	xorps	%xmm0, %xmm0
0000000000062fc0	movl	$0x3f800000, (%rdx)             ## imm = 0x3F800000
0000000000062fc6	xorpd	%xmm5, %xmm5
0000000000062fca	ucomisd	%xmm1, %xmm5
0000000000062fce	ja	0x62ff4
0000000000062fd0	cvtsd2ss	%xmm1, %xmm1
0000000000062fd4	xorps	%xmm5, %xmm5
0000000000062fd7	cvtss2sd	%xmm1, %xmm5
0000000000062fdb	jmp	0x63008
0000000000062fdd	xorps	%xmm0, %xmm0
0000000000062fe0	cvtsd2ss	%xmm5, %xmm0
0000000000062fe4	movl	$0x3f800000, (%rdx)             ## imm = 0x3F800000
0000000000062fea	xorpd	%xmm5, %xmm5
0000000000062fee	ucomisd	%xmm1, %xmm5
0000000000062ff2	jbe	0x62fd0
0000000000062ff4	addsd	%xmm1, %xmm1
0000000000062ff8	addsd	0x1509a00(%rip), %xmm1
0000000000063000	cvtsd2ss	%xmm1, %xmm1
0000000000063004	movss	%xmm1, (%rdx)
0000000000063008	movaps	%xmm0, %xmm3
000000000006300b	xorps	0x1509cde(%rip), %xmm3
0000000000063012	xorl	%eax, %eax
0000000000063014	ucomiss	%xmm0, %xmm3
0000000000063017	seta	%al
000000000006301a	movsd	0x15099de(%rip), %xmm4
0000000000063022	xorl	%ecx, %ecx
0000000000063024	ucomisd	%xmm4, %xmm5
0000000000063028	insertps	$0x1d, %xmm0, %xmm6             ## xmm6 = zero,xmm0[0],zero,zero
000000000006302e	seta	%cl
0000000000063031	movapd	%xmm4, %xmm0
0000000000063035	subsd	%xmm5, %xmm0
0000000000063039	xorps	%xmm1, %xmm1
000000000006303c	cvtsd2ss	%xmm0, %xmm1
0000000000063040	addsd	%xmm4, %xmm5
0000000000063044	cvtsd2ss	%xmm5, %xmm5
0000000000063048	mulsd	0x1509a88(%rip), %xmm2
0000000000063050	movapd	%xmm2, -0xa0(%rbp)
0000000000063058	movd	%eax, %xmm0
000000000006305c	pshufd	$0x50, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,1]
0000000000063061	pslld	$0x1f, %xmm0
0000000000063066	xorpd	%xmm4, %xmm4
000000000006306a	blendps	$0x1, %xmm3, %xmm4              ## xmm4 = xmm3[0],xmm4[1,2,3]
0000000000063070	blendvps	%xmm0, %xmm4, %xmm6
0000000000063075	movshdup	%xmm6, %xmm0                    ## xmm0 = xmm6[1,1,3,3]
0000000000063079	movaps	%xmm0, -0xf0(%rbp)
0000000000063080	movd	%ecx, %xmm0
0000000000063084	pshufd	$0x50, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,1]
0000000000063089	pslld	$0x1f, %xmm0
000000000006308e	blendps	$0xe, 0x150a0c8(%rip), %xmm1    ## xmm1 = xmm1[0],mem[1,2,3]
0000000000063098	movaps	0x150a0d1(%rip), %xmm3
000000000006309f	insertps	$0x10, %xmm5, %xmm3             ## xmm3 = xmm3[0],xmm5[0],xmm3[2,3]
00000000000630a5	blendvps	%xmm0, %xmm1, %xmm3
00000000000630aa	movaps	%xmm3, -0x60(%rbp)
00000000000630ae	movlps	%xmm6, -0x40(%rbp)
00000000000630b2	movlps	%xmm3, -0x20(%rbp)
00000000000630b6	subps	%xmm6, %xmm3
00000000000630b9	movaps	%xmm3, -0xb0(%rbp)
00000000000630c0	movshdup	%xmm3, %xmm5                    ## xmm5 = xmm3[1,1,3,3]
00000000000630c4	movaps	%xmm5, -0xd0(%rbp)
00000000000630cb	movaps	%xmm3, %xmm0
00000000000630ce	mulps	%xmm3, %xmm0
00000000000630d1	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000000630d5	addss	%xmm0, %xmm1
00000000000630d9	xorps	%xmm0, %xmm0
00000000000630dc	sqrtss	%xmm1, %xmm0
00000000000630e0	cvtps2pd	%xmm3, %xmm1
00000000000630e3	cvtss2sd	%xmm0, %xmm0
00000000000630e7	cvtps2pd	%xmm6, %xmm4
00000000000630ea	movaps	%xmm6, -0xc0(%rbp)
00000000000630f1	movapd	0x1509917(%rip), %xmm3
00000000000630f9	mulpd	%xmm1, %xmm3
00000000000630fd	addpd	%xmm4, %xmm3
0000000000063101	movddup	%xmm2, %xmm4                    ## xmm4 = xmm2[0,0]
0000000000063105	shufpd	$0x1, %xmm1, %xmm1              ## xmm1 = xmm1[1,0]
000000000006310a	mulpd	%xmm4, %xmm1
000000000006310e	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
0000000000063112	divpd	%xmm0, %xmm1
0000000000063116	addsubpd	%xmm1, %xmm3
000000000006311a	cvtpd2ps	%xmm3, %xmm0
000000000006311e	movapd	%xmm0, -0x80(%rbp)
0000000000063123	subps	%xmm6, %xmm0
0000000000063126	movaps	%xmm0, -0x90(%rbp)
000000000006312d	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
0000000000063131	movaps	%xmm0, -0xe0(%rbp)
0000000000063138	divss	%xmm5, %xmm0
000000000006313c	callq	0x1497830                       ## symbol stub for: _logf
0000000000063141	movss	%xmm0, -0x44(%rbp)
0000000000063146	movaps	-0x90(%rbp), %xmm0
000000000006314d	divss	-0xb0(%rbp), %xmm0
0000000000063155	callq	0x1497830                       ## symbol stub for: _logf
000000000006315a	movss	-0x44(%rbp), %xmm1
000000000006315f	divss	%xmm0, %xmm1
0000000000063163	movss	%xmm1, -0x44(%rbp)
0000000000063168	movapd	-0xa0(%rbp), %xmm3
0000000000063170	andpd	0x1509918(%rip), %xmm3
0000000000063178	movsd	0x15098b8(%rip), %xmm0
0000000000063180	movsd	-0x70(%rbp), %xmm2
0000000000063185	mulsd	%xmm0, %xmm2
0000000000063189	movsd	%xmm2, -0x70(%rbp)
000000000006318e	subsd	%xmm3, %xmm0
0000000000063192	movaps	-0x60(%rbp), %xmm3
0000000000063196	movaps	-0x80(%rbp), %xmm4
000000000006319a	subps	%xmm4, %xmm3
000000000006319d	movaps	%xmm3, -0x60(%rbp)
00000000000631a1	movaps	%xmm3, %xmm5
00000000000631a4	mulps	%xmm3, %xmm5
00000000000631a7	movshdup	%xmm5, %xmm2                    ## xmm2 = xmm5[1,1,3,3]
00000000000631ab	addss	%xmm5, %xmm2
00000000000631af	sqrtss	%xmm2, %xmm2
00000000000631b3	movaps	%xmm2, -0xa0(%rbp)
00000000000631ba	movaps	%xmm3, %xmm2
00000000000631bd	minss	-0x90(%rbp), %xmm2
00000000000631c5	cvtss2sd	%xmm2, %xmm2
00000000000631c9	mulsd	%xmm0, %xmm2
00000000000631cd	xorps	%xmm0, %xmm0
00000000000631d0	cvtsd2ss	%xmm2, %xmm0
00000000000631d4	movss	%xmm0, -0x48(%rbp)
00000000000631d9	addss	%xmm0, %xmm4
00000000000631dd	movaps	%xmm4, -0x100(%rbp)
00000000000631e4	movaps	%xmm4, %xmm0
00000000000631e7	subss	-0xc0(%rbp), %xmm0
00000000000631ef	divss	-0xb0(%rbp), %xmm0
00000000000631f7	callq	0x1497a46                       ## symbol stub for: _powf
00000000000631fc	mulss	-0xd0(%rbp), %xmm0
0000000000063204	addss	-0xf0(%rbp), %xmm0
000000000006320c	movss	-0x48(%rbp), %xmm3
0000000000063211	xorps	%xmm1, %xmm1
0000000000063214	cvtss2sd	%xmm3, %xmm1
0000000000063218	mulsd	-0x70(%rbp), %xmm1
000000000006321d	cvtsd2ss	%xmm1, %xmm1
0000000000063221	movaps	%xmm1, -0x70(%rbp)
0000000000063225	movaps	0x1509ac4(%rip), %xmm2
000000000006322c	xorps	%xmm1, %xmm2
000000000006322f	movaps	-0x60(%rbp), %xmm4
0000000000063233	shufps	$0xe1, %xmm4, %xmm4             ## xmm4 = xmm4[1,0,2,3]
0000000000063237	insertps	$0x1c, %xmm1, %xmm2             ## xmm2 = xmm2[0],xmm1[0],zero,zero
000000000006323d	mulps	%xmm4, %xmm2
0000000000063240	movsldup	-0xa0(%rbp), %xmm1              ## xmm1 = mem[0,0,2,2]
0000000000063248	divps	%xmm1, %xmm2
000000000006324b	movaps	-0x100(%rbp), %xmm1
0000000000063252	insertps	$0x10, %xmm0, %xmm1             ## xmm1 = xmm1[0],xmm0[0],xmm1[2,3]
0000000000063258	addps	%xmm2, %xmm1
000000000006325b	movaps	-0x80(%rbp), %xmm2
000000000006325f	movaps	%xmm2, %xmm0
0000000000063262	movlhps	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
0000000000063265	movaps	%xmm0, -0x30(%rbp)
0000000000063269	movaps	-0x90(%rbp), %xmm0
0000000000063270	mulss	%xmm0, %xmm0
0000000000063274	movaps	-0xe0(%rbp), %xmm1
000000000006327b	mulss	%xmm1, %xmm1
000000000006327f	addss	%xmm0, %xmm1
0000000000063283	xorps	%xmm0, %xmm0
0000000000063286	sqrtss	%xmm1, %xmm0
000000000006328a	movss	%xmm0, -0x60(%rbp)
000000000006328f	movaps	%xmm2, %xmm0
0000000000063292	subss	%xmm3, %xmm0
0000000000063296	movaps	%xmm0, -0x80(%rbp)
000000000006329a	subss	-0xc0(%rbp), %xmm0
00000000000632a2	divss	-0xb0(%rbp), %xmm0
00000000000632aa	movss	-0x44(%rbp), %xmm1
00000000000632af	callq	0x1497a46                       ## symbol stub for: _powf
00000000000632b4	mulss	-0xd0(%rbp), %xmm0
00000000000632bc	addss	-0xf0(%rbp), %xmm0
00000000000632c4	movaps	-0xe0(%rbp), %xmm1
00000000000632cb	movaps	-0x70(%rbp), %xmm2
00000000000632cf	mulss	%xmm2, %xmm1
00000000000632d3	movss	-0x60(%rbp), %xmm3
00000000000632d8	divss	%xmm3, %xmm1
00000000000632dc	addss	-0x80(%rbp), %xmm1
00000000000632e1	movss	%xmm1, -0x38(%rbp)
00000000000632e6	movaps	-0x90(%rbp), %xmm1
00000000000632ed	mulss	%xmm2, %xmm1
00000000000632f1	divss	%xmm3, %xmm1
00000000000632f5	subss	%xmm1, %xmm0
00000000000632f9	movss	%xmm0, -0x34(%rbp)
00000000000632fe	leaq	-0x40(%rbp), %rdi
0000000000063302	movl	$0x5, %esi
0000000000063307	movq	%rbx, %rdx
000000000006330a	callq	__Z14ASpline2BezierP6point2iS0_ ## ASpline2Bezier(point2*, int, point2*)
000000000006330f	movq	0x188a8b2(%rip), %rax           ## literal pool symbol address: ___stack_chk_guard
0000000000063316	movq	(%rax), %rax
0000000000063319	cmpq	-0x10(%rbp), %rax
000000000006331d	jne	0x63329
000000000006331f	addq	$0xf8, %rsp
0000000000063326	popq	%rbx
0000000000063327	popq	%rbp
0000000000063328	retq
0000000000063329	callq	0x14974f4                       ## symbol stub for: ___stack_chk_fail
000000000006332e	nop
