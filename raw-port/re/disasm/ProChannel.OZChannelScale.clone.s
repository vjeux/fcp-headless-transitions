__ZNK14OZChannelScale5cloneEv:
0000000000086530	pushq	%rbp
0000000000086531	movq	%rsp, %rbp
0000000000086534	pushq	%r14
0000000000086536	pushq	%rbx
0000000000086537	movq	%rdi, %r14
000000000008653a	movl	$0x1b8, %edi                    ## imm = 0x1B8
000000000008653f	callq	0xace4c                         ## symbol stub for: __Znwm
0000000000086544	movq	%rax, %rbx
0000000000086547	movq	%rax, %rdi
000000000008654a	movq	%r14, %rsi
000000000008654d	xorl	%edx, %edx
000000000008654f	callq	__ZN11OZChannel2DC2ERKS_P15OZChannelFolder ## OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)
0000000000086554	leaq	0x58845(%rip), %rax
000000000008655b	movq	%rax, (%rbx)
000000000008655e	leaq	0x58b83(%rip), %rax
0000000000086565	movq	%rax, 0x10(%rbx)
0000000000086569	movq	%rbx, %rax
000000000008656c	popq	%rbx
000000000008656d	popq	%r14
000000000008656f	popq	%rbp
0000000000086570	retq
0000000000086571	movq	%rax, %r14
0000000000086574	movq	%rbx, %rdi
0000000000086577	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000008657c	movq	%r14, %rdi
000000000008657f	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
