__ZN15HGComicQuantize6GetROIEP10HGRendereri6HGRect:
0000000000007590	pushq	%rbp
0000000000007591	movq	%rsp, %rbp
0000000000007594	pushq	%r15
0000000000007596	pushq	%r14
0000000000007598	pushq	%rbx
0000000000007599	subq	$0xb8, %rsp
00000000000075a0	testl	%edx, %edx
00000000000075a2	je	0x75b7
00000000000075a4	leaq	_HGRectNull(%rip), %rax
00000000000075ab	movups	(%rax), %xmm0
00000000000075ae	movaps	%xmm0, -0x30(%rbp)
00000000000075b2	jmp	0x765c
00000000000075b7	movq	%r8, %rbx
00000000000075ba	movq	%rcx, %r14
00000000000075bd	movss	0x19c(%rdi), %xmm0
00000000000075c5	cvtss2sd	%xmm0, %xmm0
00000000000075c9	movsd	0x3c2c8f(%rip), %xmm1
00000000000075d1	divsd	%xmm0, %xmm1
00000000000075d5	movsd	%xmm1, -0x38(%rbp)
00000000000075da	leaq	-0xc8(%rbp), %r15
00000000000075e1	movq	%r15, %rdi
00000000000075e4	callq	__ZN11HGTransformC1Ev           ## HGTransform::HGTransform()
00000000000075e9	movq	%r15, %rdi
00000000000075ec	movsd	-0x38(%rbp), %xmm0
00000000000075f1	movaps	%xmm0, %xmm1
00000000000075f4	movsd	0x3c2c64(%rip), %xmm2
00000000000075fc	callq	__ZN11HGTransform5ScaleEddd     ## HGTransform::Scale(double, double, double)
0000000000007601	callq	__ZN16HGTransformUtils4MinWEv   ## HGTransformUtils::MinW()
0000000000007606	movaps	%xmm0, %xmm1
0000000000007609	leaq	-0xc8(%rbp), %rdi
0000000000007610	movss	0x3c06b0(%rip), %xmm0
0000000000007618	movq	%r14, %rsi
000000000000761b	movq	%rbx, %rdx
000000000000761e	callq	__ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff ## HGTransformUtils::GetROI(HGTransform const*, HGRect, float, float)
0000000000007623	movq	%rax, -0x30(%rbp)
0000000000007627	movq	%rdx, -0x28(%rbp)
000000000000762b	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
0000000000007630	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000007635	movl	$0x1, %edx
000000000000763a	movl	$0x1, %ecx
000000000000763f	callq	_HGRectMake4i
0000000000007644	leaq	-0x30(%rbp), %rdi
0000000000007648	movq	%rax, %rsi
000000000000764b	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
0000000000007650	leaq	-0xc8(%rbp), %rdi
0000000000007657	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
000000000000765c	movq	-0x30(%rbp), %rax
0000000000007660	movq	-0x28(%rbp), %rdx
0000000000007664	addq	$0xb8, %rsp
000000000000766b	popq	%rbx
000000000000766c	popq	%r14
000000000000766e	popq	%r15
0000000000007670	popq	%rbp
0000000000007671	retq
0000000000007672	jmp	0x7674
0000000000007674	movq	%rax, %rbx
0000000000007677	leaq	-0xc8(%rbp), %rdi
000000000000767e	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
0000000000007683	movq	%rbx, %rdi
0000000000007686	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000000768b	nopl	(%rax,%rax)
