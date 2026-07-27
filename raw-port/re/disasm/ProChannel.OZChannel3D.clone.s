__ZNK11OZChannel3D5cloneEv:
0000000000049164	pushq	%rbp
0000000000049165	movq	%rsp, %rbp
0000000000049168	pushq	%r14
000000000004916a	pushq	%rbx
000000000004916b	movq	%rdi, %r14
000000000004916e	movl	$0x250, %edi                    ## imm = 0x250
0000000000049173	callq	0xace4c                         ## symbol stub for: __Znwm
0000000000049178	movq	%rax, %rbx
000000000004917b	movq	%rax, %rdi
000000000004917e	movq	%r14, %rsi
0000000000049181	xorl	%edx, %edx
0000000000049183	callq	__ZN11OZChannel3DC2ERKS_P15OZChannelFolder ## OZChannel3D::OZChannel3D(OZChannel3D const&, OZChannelFolder*)
0000000000049188	movq	%rbx, %rax
000000000004918b	popq	%rbx
000000000004918c	popq	%r14
000000000004918e	popq	%rbp
000000000004918f	retq
0000000000049190	movq	%rax, %r14
0000000000049193	movq	%rbx, %rdi
0000000000049196	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000004919b	movq	%r14, %rdi
000000000004919e	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000491a3	nop
