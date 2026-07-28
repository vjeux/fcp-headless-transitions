__ZN13HGComicStroke6GetDODEP10HGRendereri6HGRect:
0000000000170560	pushq	%rbp
0000000000170561	movq	%rsp, %rbp
0000000000170564	pushq	%r14
0000000000170566	pushq	%rbx
0000000000170567	subq	$0xb0, %rsp
000000000017056e	movq	%rcx, -0x20(%rbp)
0000000000170572	movq	%r8, -0x18(%rbp)
0000000000170576	testl	%edx, %edx
0000000000170578	je	0x17058d
000000000017057a	leaq	_HGRectNull(%rip), %rcx
0000000000170581	movq	(%rcx), %rax
0000000000170584	movq	0x8(%rcx), %rdx
0000000000170588	jmp	0x170621
000000000017058d	movq	%rdi, %rbx
0000000000170590	leaq	-0x20(%rbp), %rdi
0000000000170594	callq	__ZNK6HGRect10IsInfiniteEv      ## HGRect::IsInfinite() const
0000000000170599	testb	%al, %al
000000000017059b	je	0x1705a7
000000000017059d	movq	-0x20(%rbp), %rax
00000000001705a1	movq	-0x18(%rbp), %rdx
00000000001705a5	jmp	0x170621
00000000001705a7	movss	0x1a4(%rbx), %xmm0
00000000001705af	cvtss2sd	%xmm0, %xmm0
00000000001705b3	movsd	%xmm0, -0x28(%rbp)
00000000001705b8	leaq	-0xb8(%rbp), %rbx
00000000001705bf	movq	%rbx, %rdi
00000000001705c2	callq	__ZN11HGTransformC1Ev           ## HGTransform::HGTransform()
00000000001705c7	movsd	0x259c91(%rip), %xmm2
00000000001705cf	movq	%rbx, %rdi
00000000001705d2	movsd	-0x28(%rbp), %xmm0
00000000001705d7	movaps	%xmm0, %xmm1
00000000001705da	callq	__ZN11HGTransform5ScaleEddd     ## HGTransform::Scale(double, double, double)
00000000001705df	movq	-0x20(%rbp), %rbx
00000000001705e3	movq	-0x18(%rbp), %r14
00000000001705e7	callq	__ZN16HGTransformUtils4MinWEv   ## HGTransformUtils::MinW()
00000000001705ec	movaps	%xmm0, %xmm1
00000000001705ef	leaq	-0xb8(%rbp), %rdi
00000000001705f6	movss	0x2576ca(%rip), %xmm0
00000000001705fe	movq	%rbx, %rsi
0000000000170601	movq	%r14, %rdx
0000000000170604	callq	__ZN16HGTransformUtils6GetDODEPK11HGTransform6HGRectff ## HGTransformUtils::GetDOD(HGTransform const*, HGRect, float, float)
0000000000170609	movq	%rax, %rbx
000000000017060c	movq	%rdx, %r14
000000000017060f	leaq	-0xb8(%rbp), %rdi
0000000000170616	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
000000000017061b	movq	%rbx, %rax
000000000017061e	movq	%r14, %rdx
0000000000170621	addq	$0xb0, %rsp
0000000000170628	popq	%rbx
0000000000170629	popq	%r14
000000000017062b	popq	%rbp
000000000017062c	retq
000000000017062d	jmp	0x17062f
000000000017062f	movq	%rax, %rbx
0000000000170632	leaq	-0xb8(%rbp), %rdi
0000000000170639	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
000000000017063e	movq	%rbx, %rdi
0000000000170641	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000170646	nopw	%cs:(%rax,%rax)
