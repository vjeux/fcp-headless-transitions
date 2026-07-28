__ZN28LiErrorCompileFailedMaterialC1Ev:
00000000005ae3f0	pushq	%rbp
00000000005ae3f1	movq	%rsp, %rbp
00000000005ae3f4	pushq	%r14
00000000005ae3f6	pushq	%rbx
00000000005ae3f7	movq	%rdi, %rbx
00000000005ae3fa	leaq	0x2b8(%rdi), %r14
00000000005ae401	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000005ae408	addq	$0x10, %rax
00000000005ae40c	movq	%rax, 0x2b8(%rdi)
00000000005ae413	movq	$0x0, 0x2c0(%rdi)
00000000005ae41e	movq	0x27759b(%rip), %rsi            ## literal pool symbol address: __ZTT28LiErrorCompileFailedMaterial
00000000005ae425	addq	$0x8, %rsi
00000000005ae429	callq	0x6dd3bc                        ## symbol stub for: __ZN10LiMaterialC2Ev
00000000005ae42e	movq	0x2775eb(%rip), %rax            ## literal pool symbol address: __ZTV28LiErrorCompileFailedMaterial
00000000005ae435	leaq	0x18(%rax), %rcx
00000000005ae439	movq	%rcx, (%rbx)
00000000005ae43c	addq	$0xf0, %rax
00000000005ae442	movq	%rax, 0x2b8(%rbx)
00000000005ae449	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000005ae453	movq	%rax, 0x298(%rbx)
00000000005ae45a	xorps	%xmm0, %xmm0
00000000005ae45d	movups	%xmm0, 0x2a0(%rbx)
00000000005ae464	movq	%rax, 0x2b0(%rbx)
00000000005ae46b	popq	%rbx
00000000005ae46c	popq	%r14
00000000005ae46e	popq	%rbp
00000000005ae46f	retq
00000000005ae470	movq	%rax, %rbx
00000000005ae473	movq	%r14, %rdi
00000000005ae476	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
00000000005ae47b	movq	%rbx, %rdi
00000000005ae47e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005ae483	nopw	%cs:(%rax,%rax)
