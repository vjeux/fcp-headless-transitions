__ZNK11OZChannel2D5cloneEv:
000000000004791a	pushq	%rbp
000000000004791b	movq	%rsp, %rbp
000000000004791e	pushq	%r14
0000000000047920	pushq	%rbx
0000000000047921	movq	%rdi, %r14
0000000000047924	movl	$0x1b8, %edi                    ## imm = 0x1B8
0000000000047929	callq	0xace4c                         ## symbol stub for: __Znwm
000000000004792e	movq	%rax, %rbx
0000000000047931	movq	%rax, %rdi
0000000000047934	movq	%r14, %rsi
0000000000047937	xorl	%edx, %edx
0000000000047939	callq	__ZN11OZChannel2DC2ERKS_P15OZChannelFolder ## OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)
000000000004793e	movq	%rbx, %rax
0000000000047941	popq	%rbx
0000000000047942	popq	%r14
0000000000047944	popq	%rbp
0000000000047945	retq
0000000000047946	movq	%rax, %r14
0000000000047949	movq	%rbx, %rdi
000000000004794c	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000047951	movq	%r14, %rdi
0000000000047954	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000047959	nop
