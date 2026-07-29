00000000000bc79c	pushq	%rbp
00000000000bc79d	movq	%rsp, %rbp
00000000000bc7a0	pushq	%r15
00000000000bc7a2	pushq	%r14
00000000000bc7a4	pushq	%rbx
00000000000bc7a5	pushq	%rax
00000000000bc7a6	movq	%rdi, %rbx
00000000000bc7a9	leaq	__ZTV11PCException(%rip), %rax  ## vtable for PCException
00000000000bc7b0	addq	$0x10, %rax
00000000000bc7b4	movq	%rax, (%rdi)
00000000000bc7b7	movq	$0x0, 0x8(%rdi)
00000000000bc7bf	leaq	0x10(%rdi), %r14
00000000000bc7c3	movq	%r14, %rdi
00000000000bc7c6	callq	__ZN8PCStringC1ERKS_            ## PCString::PCString(PCString const&)
00000000000bc7cb	leaq	0x18(%rbx), %rdi
00000000000bc7cf	callq	__ZN8PCStringC1Ev               ## PCString::PCString()
00000000000bc7d4	movl	$0x0, 0x20(%rbx)
00000000000bc7db	xorps	%xmm0, %xmm0
00000000000bc7de	movups	%xmm0, 0x28(%rbx)
00000000000bc7e2	movq	$0x0, 0x38(%rbx)
00000000000bc7ea	addq	$0x8, %rsp
00000000000bc7ee	popq	%rbx
00000000000bc7ef	popq	%r14
00000000000bc7f1	popq	%r15
00000000000bc7f3	popq	%rbp
00000000000bc7f4	retq
00000000000bc7f5	movq	%rax, %r15
00000000000bc7f8	movq	%r14, %rdi
00000000000bc7fb	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000bc800	jmp	0xbc805
00000000000bc802	movq	%rax, %r15
00000000000bc805	leaq	0x8(%rbx), %rdi
00000000000bc809	callq	__ZN7PCCFRefIPK9__CFArrayED2Ev  ## PCCFRef<__CFArray const*>::~PCCFRef()
00000000000bc80e	movq	%rbx, %rdi
00000000000bc811	callq	0xde6ae                         ## symbol stub for: __ZNSt9exceptionD2Ev
00000000000bc816	movq	%r15, %rdi
00000000000bc819	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000bc81e	addb	%al, (%rax)
