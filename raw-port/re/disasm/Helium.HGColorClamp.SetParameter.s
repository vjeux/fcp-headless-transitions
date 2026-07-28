__ZN12HGColorClamp12SetParameterEiffff:
0000000000152190	testl	%esi, %esi
0000000000152192	je	0x1521b4
0000000000152194	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
0000000000152199	cmpl	$0x1, %esi
000000000015219c	jne	0x1521eb
000000000015219e	movl	$0x1bc, %eax                    ## imm = 0x1BC
00000000001521a3	movl	$0x1b8, %ecx                    ## imm = 0x1B8
00000000001521a8	movl	$0x1b4, %edx                    ## imm = 0x1B4
00000000001521ad	movl	$0x1b0, %esi                    ## imm = 0x1B0
00000000001521b2	jmp	0x1521c8
00000000001521b4	movl	$0x1ac, %eax                    ## imm = 0x1AC
00000000001521b9	movl	$0x1a8, %ecx                    ## imm = 0x1A8
00000000001521be	movl	$0x1a4, %edx                    ## imm = 0x1A4
00000000001521c3	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000001521c8	pushq	%rbp
00000000001521c9	movq	%rsp, %rbp
00000000001521cc	movss	%xmm0, (%rdi,%rsi)
00000000001521d1	movss	%xmm1, (%rdi,%rdx)
00000000001521d6	movss	%xmm2, (%rdi,%rcx)
00000000001521db	movss	%xmm3, (%rdi,%rax)
00000000001521e0	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001521e5	movl	$0x1, %eax
00000000001521ea	popq	%rbp
00000000001521eb	retq
00000000001521ec	nopl	(%rax)
