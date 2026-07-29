__ZN11HGToneCurve12SetParameterEiffff:
00000000002481f0	pushq	%rbp
00000000002481f1	movq	%rsp, %rbp
00000000002481f4	pushq	%rbx
00000000002481f5	pushq	%rax
00000000002481f6	movq	%rdi, %rbx
00000000002481f9	cmpl	$0x2, %esi
00000000002481fc	je	0x248294
0000000000248202	cmpl	$0x1, %esi
0000000000248205	je	0x248272
0000000000248207	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000024820c	testl	%esi, %esi
000000000024820e	jne	0x248326
0000000000248214	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000024821a	xorps	%xmm4, %xmm4
000000000024821d	movsd	0x645bcb(%rip), %xmm1
0000000000248225	cmpltps	%xmm0, %xmm1
0000000000248229	movaps	%xmm0, %xmm5
000000000024822c	movaps	%xmm0, %xmm3
000000000024822f	movaps	%xmm1, %xmm0
0000000000248232	blendvps	%xmm0, 0x645bc5(%rip), %xmm5
000000000024823b	movaps	%xmm3, %xmm0
000000000024823e	cvttps2dq	%xmm5, %xmm1
0000000000248242	movdqa	%xmm1, %xmm3
0000000000248246	psrad	$0x1f, %xmm3
000000000024824b	subps	0x645bbe(%rip), %xmm5
0000000000248252	cvttps2dq	%xmm5, %xmm5
0000000000248256	pand	%xmm3, %xmm5
000000000024825a	por	%xmm1, %xmm5
000000000024825e	cmpnltps	%xmm4, %xmm0
0000000000248262	andps	%xmm5, %xmm0
0000000000248265	pxor	%xmm1, %xmm1
0000000000248269	ucomiss	%xmm2, %xmm1
000000000024826c	jbe	0x2482ae
000000000024826e	xorl	%eax, %eax
0000000000248270	jmp	0x2482c3
0000000000248272	movss	%xmm0, 0x1b8(%rbx)
000000000024827a	movss	%xmm1, 0x1bc(%rbx)
0000000000248282	movss	%xmm2, 0x1c0(%rbx)
000000000024828a	movd	%xmm3, 0x1c4(%rbx)
0000000000248292	jmp	0x2482d0
0000000000248294	movss	%xmm0, 0x1c8(%rbx)
000000000024829c	movss	%xmm1, 0x1cc(%rbx)
00000000002482a4	movss	%xmm2, 0x1d0(%rbx)
00000000002482ac	jmp	0x2482d0
00000000002482ae	movss	0x17fa0a(%rip), %xmm1
00000000002482b6	minss	%xmm2, %xmm1
00000000002482ba	cvttss2si	%xmm1, %eax
00000000002482be	testl	%eax, %eax
00000000002482c0	setne	%al
00000000002482c3	movlps	%xmm0, 0x198(%rbx)
00000000002482ca	movb	%al, 0x1a0(%rbx)
00000000002482d0	movq	%rbx, %rdi
00000000002482d3	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000002482d8	movl	0x198(%rbx), %edi
00000000002482de	movss	0x1b8(%rbx), %xmm0
00000000002482e6	movss	0x1bc(%rbx), %xmm1
00000000002482ee	movss	0x1c0(%rbx), %xmm2
00000000002482f6	movss	0x1c4(%rbx), %xmm3
00000000002482fe	movss	0x1c8(%rbx), %xmm4
0000000000248306	movss	0x1cc(%rbx), %xmm5
000000000024830e	movss	0x1d0(%rbx), %xmm6
0000000000248316	callq	__ZN11HGToneCurve16AcceleratedStateENS_15hgToneCurveFormEfffffff ## HGToneCurve::AcceleratedState(HGToneCurve::hgToneCurveForm, float, float, float, float, float, float, float)
000000000024831b	movl	%eax, 0x1a8(%rbx)
0000000000248321	movl	$0x1, %eax
0000000000248326	addq	$0x8, %rsp
000000000024832a	popq	%rbx
000000000024832b	popq	%rbp
000000000024832c	retq
000000000024832d	nopl	(%rax)
