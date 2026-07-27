_HGRectIntegral:
0000000000107be0	ucomiss	%xmm1, %xmm0
0000000000107be3	ja	0x107bf6
0000000000107be5	movaps	%xmm1, %xmm2
0000000000107be8	cmpltps	%xmm0, %xmm2
0000000000107bec	pextrb	$0x4, %xmm2, %eax
0000000000107bf2	testb	$0x1, %al
0000000000107bf4	je	0x107c00
0000000000107bf6	xorl	%eax, %eax
0000000000107bf8	xorl	%ecx, %ecx
0000000000107bfa	xorl	%edx, %edx
0000000000107bfc	orq	%rcx, %rax
0000000000107bff	retq
0000000000107c00	pushq	%rbp
0000000000107c01	movq	%rsp, %rbp
0000000000107c04	movshdup	%xmm0, %xmm2                    ## xmm2 = xmm0[1,1,3,3]
0000000000107c08	movss	0x2ca670(%rip), %xmm3
0000000000107c10	maxss	%xmm3, %xmm0
0000000000107c14	roundss	$0x9, %xmm0, %xmm0
0000000000107c1a	cvttss2si	%xmm0, %eax
0000000000107c1e	maxss	%xmm3, %xmm2
0000000000107c22	xorps	%xmm0, %xmm0
0000000000107c25	roundss	$0x9, %xmm2, %xmm0
0000000000107c2b	cvttss2si	%xmm0, %ecx
0000000000107c2f	movaps	0x2ca60a(%rip), %xmm2
0000000000107c36	movaps	%xmm2, %xmm3
0000000000107c39	minps	%xmm1, %xmm3
0000000000107c3c	cmpunordps	%xmm1, %xmm1
0000000000107c40	movaps	%xmm1, %xmm0
0000000000107c43	blendvps	%xmm0, %xmm2, %xmm3
0000000000107c48	roundps	$0xa, %xmm3, %xmm0
0000000000107c4e	cvttss2si	%xmm0, %edx
0000000000107c52	cmpleps	%xmm0, %xmm2
0000000000107c56	unpcklps	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0,1,1]
0000000000107c59	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
0000000000107c5d	cvttss2si	%xmm0, %esi
0000000000107c61	movd	%edx, %xmm1
0000000000107c65	movd	%esi, %xmm0
0000000000107c69	psllq	$0x20, %xmm0
0000000000107c6e	punpcklqdq	%xmm0, %xmm1            ## xmm1 = xmm1[0],xmm0[0]
0000000000107c72	movaps	%xmm2, %xmm0
0000000000107c75	blendvpd	%xmm0, 0x2ca5e2(%rip), %xmm1
0000000000107c7e	pshufd	$0xee, %xmm1, %xmm0             ## xmm0 = xmm1[2,3,2,3]
0000000000107c83	por	%xmm1, %xmm0
0000000000107c87	movq	%xmm0, %rdx
0000000000107c8c	shlq	$0x20, %rcx
0000000000107c90	popq	%rbp
0000000000107c91	orq	%rcx, %rax
0000000000107c94	retq
0000000000107c95	nopw	%cs:(%rax,%rax)
