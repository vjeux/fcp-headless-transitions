__ZN13HGComicStroke6GetROIEP10HGRendereri6HGRect:
0000000000170650	pushq	%rbp
0000000000170651	movq	%rsp, %rbp
0000000000170654	pushq	%r15
0000000000170656	pushq	%r14
0000000000170658	pushq	%r12
000000000017065a	pushq	%rbx
000000000017065b	subq	$0xb0, %rsp
0000000000170662	movq	%r8, %r14
0000000000170665	movq	%rcx, %r15
0000000000170668	cmpl	$0x1, %edx
000000000017066b	je	0x170752
0000000000170671	testl	%edx, %edx
0000000000170673	jne	0x170781
0000000000170679	movq	%rdi, %rbx
000000000017067c	movss	0x1a4(%rdi), %xmm0
0000000000170684	cvtss2sd	%xmm0, %xmm0
0000000000170688	movsd	0x259bd0(%rip), %xmm1
0000000000170690	divsd	%xmm0, %xmm1
0000000000170694	movsd	%xmm1, -0x38(%rbp)
0000000000170699	leaq	-0xc8(%rbp), %r12
00000000001706a0	movq	%r12, %rdi
00000000001706a3	callq	__ZN11HGTransformC1Ev           ## HGTransform::HGTransform()
00000000001706a8	movq	%r12, %rdi
00000000001706ab	movsd	-0x38(%rbp), %xmm0
00000000001706b0	movaps	%xmm0, %xmm1
00000000001706b3	movsd	0x259ba5(%rip), %xmm2
00000000001706bb	callq	__ZN11HGTransform5ScaleEddd     ## HGTransform::Scale(double, double, double)
00000000001706c0	callq	__ZN16HGTransformUtils4MinWEv   ## HGTransformUtils::MinW()
00000000001706c5	movaps	%xmm0, %xmm1
00000000001706c8	leaq	-0xc8(%rbp), %rdi
00000000001706cf	movss	0x2575f1(%rip), %xmm0
00000000001706d7	movq	%r15, %rsi
00000000001706da	movq	%r14, %rdx
00000000001706dd	callq	__ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff ## HGTransformUtils::GetROI(HGTransform const*, HGRect, float, float)
00000000001706e2	movq	%rax, -0x30(%rbp)
00000000001706e6	movq	%rdx, -0x28(%rbp)
00000000001706ea	movss	0x198(%rbx), %xmm0
00000000001706f2	addss	%xmm0, %xmm0
00000000001706f6	roundss	$0xa, %xmm0, %xmm0
00000000001706fc	cvttss2si	%xmm0, %eax
0000000000170700	movq	%rax, %rdx
0000000000170703	shlq	$0x20, %rdx
0000000000170707	orq	%rax, %rdx
000000000017070a	negl	%eax
000000000017070c	movq	%rax, %rsi
000000000017070f	shlq	$0x20, %rsi
0000000000170713	orq	%rax, %rsi
0000000000170716	leaq	-0x30(%rbp), %rdi
000000000017071a	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
000000000017071f	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
0000000000170724	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000170729	movl	$0x1, %edx
000000000017072e	movl	$0x1, %ecx
0000000000170733	callq	_HGRectMake4i
0000000000170738	leaq	-0x30(%rbp), %rdi
000000000017073c	movq	%rax, %rsi
000000000017073f	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
0000000000170744	leaq	-0xc8(%rbp), %rdi
000000000017074b	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
0000000000170750	jmp	0x17078f
0000000000170752	movq	%r15, -0x30(%rbp)
0000000000170756	movq	%r14, -0x28(%rbp)
000000000017075a	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
000000000017075f	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000170764	movl	$0x1, %edx
0000000000170769	movl	$0x1, %ecx
000000000017076e	callq	_HGRectMake4i
0000000000170773	leaq	-0x30(%rbp), %rdi
0000000000170777	movq	%rax, %rsi
000000000017077a	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
000000000017077f	jmp	0x17078f
0000000000170781	leaq	_HGRectNull(%rip), %rax
0000000000170788	movups	(%rax), %xmm0
000000000017078b	movaps	%xmm0, -0x30(%rbp)
000000000017078f	movq	-0x30(%rbp), %rax
0000000000170793	movq	-0x28(%rbp), %rdx
0000000000170797	addq	$0xb0, %rsp
000000000017079e	popq	%rbx
000000000017079f	popq	%r12
00000000001707a1	popq	%r14
00000000001707a3	popq	%r15
00000000001707a5	popq	%rbp
00000000001707a6	retq
00000000001707a7	jmp	0x1707ab
00000000001707a9	jmp	0x1707ab
00000000001707ab	movq	%rax, %rbx
00000000001707ae	leaq	-0xc8(%rbp), %rdi
00000000001707b5	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
00000000001707ba	movq	%rbx, %rdi
00000000001707bd	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001707c2	nopw	%cs:(%rax,%rax)
