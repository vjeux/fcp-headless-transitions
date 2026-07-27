__ZNK19OZChannelRotation3D5cloneEv:
0000000000081692	pushq	%rbp
0000000000081693	movq	%rsp, %rbp
0000000000081696	pushq	%r14
0000000000081698	pushq	%rbx
0000000000081699	movq	%rdi, %r14
000000000008169c	movl	$0x358, %edi                    ## imm = 0x358
00000000000816a1	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000816a6	movq	%rax, %rbx
00000000000816a9	movq	%rax, %rdi
00000000000816ac	movq	%r14, %rsi
00000000000816af	xorl	%edx, %edx
00000000000816b1	callq	__ZN19OZChannelRotation3DC2ERKS_P15OZChannelFolder ## OZChannelRotation3D::OZChannelRotation3D(OZChannelRotation3D const&, OZChannelFolder*)
00000000000816b6	movq	%rbx, %rax
00000000000816b9	popq	%rbx
00000000000816ba	popq	%r14
00000000000816bc	popq	%rbp
00000000000816bd	retq
00000000000816be	movq	%rax, %r14
00000000000816c1	movq	%rbx, %rdi
00000000000816c4	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000816c9	movq	%r14, %rdi
00000000000816cc	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000816d1	nop
