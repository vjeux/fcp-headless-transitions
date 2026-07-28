__ZNK17OZChannelTimecode5cloneEv:
000000000001d4cc	pushq	%rbp
000000000001d4cd	movq	%rsp, %rbp
000000000001d4d0	pushq	%r14
000000000001d4d2	pushq	%rbx
000000000001d4d3	movq	%rdi, %r14
000000000001d4d6	movl	$0x98, %edi
000000000001d4db	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001d4e0	movq	%rax, %rbx
000000000001d4e3	movq	%rax, %rdi
000000000001d4e6	movq	%r14, %rsi
000000000001d4e9	xorl	%edx, %edx
000000000001d4eb	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000001d4f0	leaq	0xb6cf9(%rip), %rax
000000000001d4f7	movq	%rax, (%rbx)
000000000001d4fa	leaq	0xb704f(%rip), %rax
000000000001d501	movq	%rax, 0x10(%rbx)
000000000001d505	movq	%rbx, %rax
000000000001d508	popq	%rbx
000000000001d509	popq	%r14
000000000001d50b	popq	%rbp
000000000001d50c	retq
000000000001d50d	movq	%rax, %r14
000000000001d510	movq	%rbx, %rdi
000000000001d513	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000001d518	movq	%r14, %rdi
000000000001d51b	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
