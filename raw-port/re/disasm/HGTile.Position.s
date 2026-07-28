__ZNK6HGTile8PositionEv:
0000000000690cc0	pushq	%rbp
0000000000690cc1	movq	%rsp, %rbp
0000000000690cc4	movq	%rdi, -0x58(%rbp)
0000000000690cc8	movq	-0x58(%rbp), %rax
0000000000690ccc	movaps	0x7a30d(%rip), %xmm0
0000000000690cd3	movaps	%xmm0, -0x70(%rbp)
0000000000690cd7	movaps	-0x70(%rbp), %xmm1
0000000000690cdb	movaps	(%rax), %xmm0
0000000000690cde	movaps	%xmm0, -0x10(%rbp)
0000000000690ce2	cvtdq2ps	-0x10(%rbp), %xmm0
0000000000690ce6	movaps	%xmm1, -0x40(%rbp)
0000000000690cea	movaps	%xmm0, -0x50(%rbp)
0000000000690cee	movaps	-0x40(%rbp), %xmm1
0000000000690cf2	movaps	-0x50(%rbp), %xmm0
0000000000690cf6	mulps	%xmm0, %xmm1
0000000000690cf9	movaps	0x83720(%rip), %xmm0
0000000000690d00	movaps	%xmm0, -0x80(%rbp)
0000000000690d04	movaps	-0x80(%rbp), %xmm0
0000000000690d08	movaps	%xmm1, -0x20(%rbp)
0000000000690d0c	movaps	%xmm0, -0x30(%rbp)
0000000000690d10	movaps	-0x20(%rbp), %xmm0
0000000000690d14	addps	-0x30(%rbp), %xmm0
0000000000690d18	popq	%rbp
0000000000690d19	retq
0000000000690d1a	nopw	(%rax,%rax)
