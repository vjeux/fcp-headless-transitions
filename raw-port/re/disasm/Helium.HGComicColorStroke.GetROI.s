__ZN18HGComicColorStroke6GetROIEP10HGRendereri6HGRect:
00000000001bc190	pushq	%rbp
00000000001bc191	movq	%rsp, %rbp
00000000001bc194	pushq	%r15
00000000001bc196	pushq	%r14
00000000001bc198	pushq	%rbx
00000000001bc199	subq	$0xb8, %rsp
00000000001bc1a0	movq	%r8, %rbx
00000000001bc1a3	movq	%rcx, %r14
00000000001bc1a6	cmpl	$0x1, %edx
00000000001bc1a9	je	0x1bc204
00000000001bc1ab	testl	%edx, %edx
00000000001bc1ad	jne	0x1bc2b6
00000000001bc1b3	movq	%r14, -0x30(%rbp)
00000000001bc1b7	movq	%rbx, -0x28(%rbp)
00000000001bc1bb	leaq	-0x30(%rbp), %rbx
00000000001bc1bf	movabsq	$-0x700000008, %rsi             ## imm = 0xFFFFFFF8FFFFFFF8
00000000001bc1c9	movabsq	$0x800000008, %rdx              ## imm = 0x800000008
00000000001bc1d3	movq	%rbx, %rdi
00000000001bc1d6	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
00000000001bc1db	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000001bc1e0	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000001bc1e5	movl	$0x1, %edx
00000000001bc1ea	movl	$0x1, %ecx
00000000001bc1ef	callq	_HGRectMake4i
00000000001bc1f4	movq	%rbx, %rdi
00000000001bc1f7	movq	%rax, %rsi
00000000001bc1fa	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
00000000001bc1ff	jmp	0x1bc2c4
00000000001bc204	movss	0x198(%rdi), %xmm0
00000000001bc20c	cvtss2sd	%xmm0, %xmm0
00000000001bc210	movsd	%xmm0, -0x38(%rbp)
00000000001bc215	leaq	-0xc8(%rbp), %r15
00000000001bc21c	movq	%r15, %rdi
00000000001bc21f	callq	__ZN11HGTransformC1Ev           ## HGTransform::HGTransform()
00000000001bc224	movsd	0x20e034(%rip), %xmm2
00000000001bc22c	movq	%r15, %rdi
00000000001bc22f	movsd	-0x38(%rbp), %xmm0
00000000001bc234	movaps	%xmm0, %xmm1
00000000001bc237	callq	__ZN11HGTransform5ScaleEddd     ## HGTransform::Scale(double, double, double)
00000000001bc23c	callq	__ZN16HGTransformUtils4MinWEv   ## HGTransformUtils::MinW()
00000000001bc241	movaps	%xmm0, %xmm1
00000000001bc244	leaq	-0xc8(%rbp), %rdi
00000000001bc24b	movss	0x20ba75(%rip), %xmm0
00000000001bc253	movq	%r14, %rsi
00000000001bc256	movq	%rbx, %rdx
00000000001bc259	callq	__ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff ## HGTransformUtils::GetROI(HGTransform const*, HGRect, float, float)
00000000001bc25e	movq	%rax, -0x30(%rbp)
00000000001bc262	movq	%rdx, -0x28(%rbp)
00000000001bc266	leaq	-0x30(%rbp), %rdi
00000000001bc26a	movabsq	$-0x700000008, %rsi             ## imm = 0xFFFFFFF8FFFFFFF8
00000000001bc274	movabsq	$0x800000008, %rdx              ## imm = 0x800000008
00000000001bc27e	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
00000000001bc283	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000001bc288	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000001bc28d	movl	$0x1, %edx
00000000001bc292	movl	$0x1, %ecx
00000000001bc297	callq	_HGRectMake4i
00000000001bc29c	leaq	-0x30(%rbp), %rdi
00000000001bc2a0	movq	%rax, %rsi
00000000001bc2a3	callq	__ZN6HGRect4GrowES_             ## HGRect::Grow(HGRect)
00000000001bc2a8	leaq	-0xc8(%rbp), %rdi
00000000001bc2af	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
00000000001bc2b4	jmp	0x1bc2c4
00000000001bc2b6	leaq	_HGRectNull(%rip), %rax
00000000001bc2bd	movups	(%rax), %xmm0
00000000001bc2c0	movaps	%xmm0, -0x30(%rbp)
00000000001bc2c4	movq	-0x30(%rbp), %rax
00000000001bc2c8	movq	-0x28(%rbp), %rdx
00000000001bc2cc	addq	$0xb8, %rsp
00000000001bc2d3	popq	%rbx
00000000001bc2d4	popq	%r14
00000000001bc2d6	popq	%r15
00000000001bc2d8	popq	%rbp
00000000001bc2d9	retq
00000000001bc2da	jmp	0x1bc2dc
00000000001bc2dc	movq	%rax, %rbx
00000000001bc2df	leaq	-0xc8(%rbp), %rdi
00000000001bc2e6	callq	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
00000000001bc2eb	movq	%rbx, %rdi
00000000001bc2ee	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001bc2f3	nopw	%cs:(%rax,%rax)
