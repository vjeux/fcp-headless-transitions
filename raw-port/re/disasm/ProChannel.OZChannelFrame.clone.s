__ZNK14OZChannelFrame5cloneEv:
000000000001d420	pushq	%rbp
000000000001d421	movq	%rsp, %rbp
000000000001d424	pushq	%r14
000000000001d426	pushq	%rbx
000000000001d427	movq	%rdi, %r14
000000000001d42a	movl	$0x98, %edi
000000000001d42f	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001d434	movq	%rax, %rbx
000000000001d437	movq	%rax, %rdi
000000000001d43a	movq	%r14, %rsi
000000000001d43d	xorl	%edx, %edx
000000000001d43f	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000001d444	leaq	0xb69d5(%rip), %rax
000000000001d44b	movq	%rax, (%rbx)
000000000001d44e	leaq	0xb6d2b(%rip), %rax
000000000001d455	movq	%rax, 0x10(%rbx)
000000000001d459	movq	%rbx, %rax
000000000001d45c	popq	%rbx
000000000001d45d	popq	%r14
000000000001d45f	popq	%rbp
000000000001d460	retq
000000000001d461	movq	%rax, %r14
000000000001d464	movq	%rbx, %rdi
000000000001d467	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000001d46c	movq	%r14, %rdi
000000000001d46f	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
