__ZNK20OZChannelRetimeFrame5cloneEv:
00000000004ee0a0	pushq	%rbp
00000000004ee0a1	movq	%rsp, %rbp
00000000004ee0a4	pushq	%r14
00000000004ee0a6	pushq	%rbx
00000000004ee0a7	movq	%rdi, %r14
00000000004ee0aa	movl	$0x98, %edi
00000000004ee0af	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000004ee0b4	movq	%rax, %rbx
00000000004ee0b7	movq	%rax, %rdi
00000000004ee0ba	movq	%r14, %rsi
00000000004ee0bd	xorl	%edx, %edx
00000000004ee0bf	callq	0x6df47a                        ## symbol stub for: __ZN9OZChannelC2ERKS_P15OZChannelFolder
00000000004ee0c4	leaq	0x389bbd(%rip), %rax
00000000004ee0cb	movq	%rax, (%rbx)
00000000004ee0ce	leaq	0x389f13(%rip), %rax
00000000004ee0d5	movq	%rax, 0x10(%rbx)
00000000004ee0d9	orb	$0x1, 0x39(%rbx)
00000000004ee0dd	movq	%rbx, %rax
00000000004ee0e0	popq	%rbx
00000000004ee0e1	popq	%r14
00000000004ee0e3	popq	%rbp
00000000004ee0e4	retq
00000000004ee0e5	movq	%rax, %r14
00000000004ee0e8	movq	%rbx, %rdi
00000000004ee0eb	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004ee0f0	movq	%r14, %rdi
00000000004ee0f3	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004ee0f8	nopl	(%rax,%rax)
