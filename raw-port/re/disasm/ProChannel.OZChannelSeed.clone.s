__ZNK13OZChannelSeed5cloneEv:
000000000001d2c8	pushq	%rbp
000000000001d2c9	movq	%rsp, %rbp
000000000001d2cc	pushq	%r14
000000000001d2ce	pushq	%rbx
000000000001d2cf	movq	%rdi, %r14
000000000001d2d2	movl	$0x98, %edi
000000000001d2d7	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001d2dc	movq	%rax, %rbx
000000000001d2df	movq	%rax, %rdi
000000000001d2e2	movq	%r14, %rsi
000000000001d2e5	xorl	%edx, %edx
000000000001d2e7	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000001d2ec	leaq	0xb638d(%rip), %rax
000000000001d2f3	movq	%rax, (%rbx)
000000000001d2f6	leaq	0xb66e3(%rip), %rax
000000000001d2fd	movq	%rax, 0x10(%rbx)
000000000001d301	movq	%rbx, %rax
000000000001d304	popq	%rbx
000000000001d305	popq	%r14
000000000001d307	popq	%rbp
000000000001d308	retq
000000000001d309	movq	%rax, %r14
000000000001d30c	movq	%rbx, %rdi
000000000001d30f	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000001d314	movq	%r14, %rdi
000000000001d317	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
