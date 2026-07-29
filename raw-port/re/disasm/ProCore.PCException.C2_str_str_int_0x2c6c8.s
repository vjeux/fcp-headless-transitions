000000000002c6c8	pushq	%rbp
000000000002c6c9	movq	%rsp, %rbp
000000000002c6cc	pushq	%r15
000000000002c6ce	pushq	%r14
000000000002c6d0	pushq	%r12
000000000002c6d2	pushq	%rbx
000000000002c6d3	movl	%ecx, %r14d
000000000002c6d6	movq	%rdx, %r12
000000000002c6d9	movq	%rdi, %rbx
000000000002c6dc	leaq	__ZTV11PCException(%rip), %rax  ## vtable for PCException
000000000002c6e3	addq	$0x10, %rax
000000000002c6e7	movq	%rax, (%rdi)
000000000002c6ea	movq	$0x0, 0x8(%rdi)
000000000002c6f2	leaq	0x10(%rdi), %r15
000000000002c6f6	movq	%r15, %rdi
000000000002c6f9	callq	__ZN8PCStringC1ERKS_            ## PCString::PCString(PCString const&)
000000000002c6fe	leaq	0x18(%rbx), %rdi
000000000002c702	movq	%r12, %rsi
000000000002c705	callq	__ZN8PCStringC1ERKS_            ## PCString::PCString(PCString const&)
000000000002c70a	movl	%r14d, 0x20(%rbx)
000000000002c70e	xorps	%xmm0, %xmm0
000000000002c711	movups	%xmm0, 0x28(%rbx)
000000000002c715	movq	$0x0, 0x38(%rbx)
000000000002c71d	popq	%rbx
000000000002c71e	popq	%r12
000000000002c720	popq	%r14
000000000002c722	popq	%r15
000000000002c724	popq	%rbp
000000000002c725	retq
000000000002c726	movq	%rax, %r14
000000000002c729	movq	%r15, %rdi
000000000002c72c	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
000000000002c731	jmp	0x2c736
000000000002c733	movq	%rax, %r14
000000000002c736	leaq	0x8(%rbx), %rdi
000000000002c73a	callq	__ZN7PCCFRefIPK9__CFArrayED2Ev  ## PCCFRef<__CFArray const*>::~PCCFRef()
000000000002c73f	movq	%rbx, %rdi
000000000002c742	callq	0xde6ae                         ## symbol stub for: __ZNSt9exceptionD2Ev
000000000002c747	movq	%r14, %rdi
000000000002c74a	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
000000000002c74f	nop
