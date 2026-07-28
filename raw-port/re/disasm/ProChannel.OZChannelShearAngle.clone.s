__ZNK19OZChannelShearAngle5cloneEv:
000000000001d018	pushq	%rbp
000000000001d019	movq	%rsp, %rbp
000000000001d01c	pushq	%r14
000000000001d01e	pushq	%rbx
000000000001d01f	movq	%rdi, %r14
000000000001d022	movl	$0x98, %edi
000000000001d027	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001d02c	movq	%rax, %rbx
000000000001d02f	movq	%rax, %rdi
000000000001d032	movq	%r14, %rsi
000000000001d035	xorl	%edx, %edx
000000000001d037	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000001d03c	leaq	0xb56fd(%rip), %rax
000000000001d043	movq	%rax, (%rbx)
000000000001d046	leaq	0xb5a53(%rip), %rax
000000000001d04d	movq	%rax, 0x10(%rbx)
000000000001d051	movq	%rbx, %rax
000000000001d054	popq	%rbx
000000000001d055	popq	%r14
000000000001d057	popq	%rbp
000000000001d058	retq
000000000001d059	movq	%rax, %r14
000000000001d05c	movq	%rbx, %rdi
000000000001d05f	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000001d064	movq	%r14, %rdi
000000000001d067	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
