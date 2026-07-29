__ZN9HGBMDFilm6Encode9GetOutputEP10HGRenderer:
00000000001033f0	pushq	%rbp
00000000001033f1	movq	%rsp, %rbp
00000000001033f4	pushq	%r14
00000000001033f6	pushq	%rbx
00000000001033f7	subq	$0x10, %rsp
00000000001033fb	movq	%rdi, %rbx
00000000001033fe	movq	0x198(%rdi), %r14
0000000000103405	movq	%rsi, %rdi
0000000000103408	movq	%rbx, %rsi
000000000010340b	xorl	%edx, %edx
000000000010340d	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000103412	movq	(%r14), %rcx
0000000000103415	movq	%r14, %rdi
0000000000103418	xorl	%esi, %esi
000000000010341a	movq	%rax, %rdx
000000000010341d	callq	*0x78(%rcx)
0000000000103420	movq	0x198(%rbx), %rdi
0000000000103427	movq	0x1a8(%rbx), %rsi
000000000010342e	movl	$0x1, %edx
0000000000103433	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000103438	xorl	%eax, %eax
000000000010343a	cmpl	$0x0, 0x1b0(%rbx)
0000000000103441	sete	%al
0000000000103444	shll	$0x2, %eax
0000000000103447	leaq	0x2cda2a(%rip), %rcx
000000000010344e	movss	(%rax,%rcx), %xmm0
0000000000103453	movss	%xmm0, -0x1c(%rbp)
0000000000103458	leaq	0x2cda21(%rip), %rcx
000000000010345f	movss	(%rax,%rcx), %xmm0
0000000000103464	movss	%xmm0, -0x18(%rbp)
0000000000103469	leaq	0x2cda18(%rip), %rcx
0000000000103470	movss	(%rax,%rcx), %xmm0
0000000000103475	movss	%xmm0, -0x14(%rbp)
000000000010347a	leaq	0x2cda0f(%rip), %rcx
0000000000103481	movss	(%rax,%rcx), %xmm0
0000000000103486	movss	%xmm0, -0x20(%rbp)
000000000010348b	movq	0x198(%rbx), %rdx
0000000000103492	movq	0x1a0(%rbx), %rdi
0000000000103499	movq	(%rdi), %rax
000000000010349c	xorl	%esi, %esi
000000000010349e	callq	*0x78(%rax)
00000000001034a1	movq	0x1a0(%rbx), %rdi
00000000001034a8	movq	(%rdi), %rax
00000000001034ab	movss	0x2cc1a5(%rip), %xmm0
00000000001034b3	xorl	%esi, %esi
00000000001034b5	movss	-0x1c(%rbp), %xmm1
00000000001034ba	movss	-0x18(%rbp), %xmm2
00000000001034bf	movss	-0x14(%rbp), %xmm3
00000000001034c4	callq	*0x60(%rax)
00000000001034c7	movq	0x1a0(%rbx), %rdi
00000000001034ce	movq	(%rdi), %rax
00000000001034d1	movss	0x2cdb0b(%rip), %xmm1
00000000001034d9	movss	0x2cdb07(%rip), %xmm2
00000000001034e1	xorps	%xmm3, %xmm3
00000000001034e4	movl	$0x1, %esi
00000000001034e9	movss	-0x20(%rbp), %xmm0
00000000001034ee	callq	*0x60(%rax)
00000000001034f1	movq	0x1a0(%rbx), %rax
00000000001034f8	addq	$0x10, %rsp
00000000001034fc	popq	%rbx
00000000001034fd	popq	%r14
00000000001034ff	popq	%rbp
0000000000103500	retq
0000000000103501	nopw	%cs:(%rax,%rax)
