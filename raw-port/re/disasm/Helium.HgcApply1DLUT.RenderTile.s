__ZN13HgcApply1DLUT10RenderTileEP6HGTile:
0000000000025000	pushq	%rbp
0000000000025001	movq	%rsp, %rbp
0000000000025004	movq	%rsi, %rax
0000000000025007	leaq	0x1a0(%rdi), %rsi
000000000002500e	leaq	0x1b0(%rdi), %rdx
0000000000025015	movzbl	0x1e0(%rdi), %r8d
000000000002501d	leaq	0x1c0(%rdi), %rcx
0000000000025024	movq	%rax, %rdi
0000000000025027	callq	__Z18Get1DLUTLinearTileP6HGTilePKfS2_S2_b ## Get1DLUTLinearTile(HGTile*, float const*, float const*, float const*, bool)
000000000002502c	xorl	%eax, %eax
000000000002502e	popq	%rbp
000000000002502f	retq
