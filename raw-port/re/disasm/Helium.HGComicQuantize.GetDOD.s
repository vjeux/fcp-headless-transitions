__ZN15HGComicQuantize6GetDODEP10HGRendereri6HGRect:
00000000000074a0	pushq	%rbp
00000000000074a1	movq	%rsp, %rbp
00000000000074a4	pushq	%r14
00000000000074a6	pushq	%rbx
00000000000074a7	subq	$0xb0, %rsp
00000000000074ae	movq	%rcx, -0x20(%rbp)
00000000000074b2	movq	%r8, -0x18(%rbp)
00000000000074b6	testl	%edx, %edx
00000000000074b8	je	0x74cd
00000000000074ba	leaq	_HGRectNull(%rip), %rcx
00000000000074c1	movq	(%rcx), %rax
00000000000074c4	movq	0x8(%rcx), %rdx
00000000000074c8	jmp	0x7561
00000000000074cd	movq	%rdi, %rbx
00000000000074d0	leaq	-0x20(%rbp), %rdi
00000000000074d4	callq	__ZNK6HGRect10IsInfiniteEv      ## HGRect::IsInfinite() const
00000000000074d9	testb	%al, %al
00000000000074db	je	0x74e7
00000000000074dd	movq	-0x20(%rbp), %rax
00000000000074e1	movq	-0x18(%rbp), %rdx
00000000000074e5	jmp	0x7561
00000000000074e7	movss	0x19c(%rbx), %xmm0
00000000000074ef	cvtss2sd	%xmm0, %xmm0
00000000000074f3	movsd	%xmm0, -0x28(%rbp)
00000000000074f8	leaq	-0xb8(%rbp), %rbx
00000000000074ff	movq	%rbx, %rdi
0000000000007502	callq	__ZN11HGTransformC1Ev           ## HGTransform::HGTransform()
0000000000007507	movsd	0x3c2d51(%rip), %xmm2
000000000000750f	movq	%rbx, %rdi
0000000000007512	movsd	-0x28(%rbp), %xmm0
0000000000007517	movaps	%xmm0, %xmm1
000000000000751a	callq	__ZN11HGTransform5ScaleEddd     ## HGTransform::Scale(double, double, double)
000000000000751f	movq	-0x20(%rbp), %rbx
0000000000007523	movq	-0x18(%rbp), %r14
0000000000007527	callq	__ZN16HGTransformUtils4MinWEv   ## HGTransformUtils::MinW()
000000000000752c	movaps	%xmm0, %xmm1
000000000000752f	leaq	-0xb8(%rbp), %rdi
0000000000007536	movss	0x3c078a(%rip), %xmm0
000000000000753e	movq	%rbx, %rsi
0000000000007541	movq	%r14, %rdx
0000000000007544	callq	__ZN16HGTransformUtils6GetDODEPK11HGTransform6HGRectff ## HGTransformUtils::GetDOD(HGTransform const*, HGRect, float, float)
0000000000007549	movq	%rax, %rbx
000000000000754c	movq	%rdx, %r14
000000000000754f	leaq	-0xb8(%rbp), %rdi
0000000000007556	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
000000000000755b	movq	%rbx, %rax
000000000000755e	movq	%r14, %rdx
0000000000007561	addq	$0xb0, %rsp
0000000000007568	popq	%rbx
0000000000007569	popq	%r14
000000000000756b	popq	%rbp
000000000000756c	retq
000000000000756d	jmp	0x756f
000000000000756f	movq	%rax, %rbx
0000000000007572	leaq	-0xb8(%rbp), %rdi
0000000000007579	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
000000000000757e	movq	%rbx, %rdi
0000000000007581	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000007586	nopw	%cs:(%rax,%rax)
