__ZN12RandMersenne7SetSeedEm:
00000000000030e4	pushq	%rbp
00000000000030e5	movq	%rsp, %rbp
00000000000030e8	pushq	%rbx
00000000000030e9	pushq	%rax
00000000000030ea	movq	%rdi, %rbx
00000000000030ed	addq	$0x8, %rdi
00000000000030f1	movl	$0x4de1, %edx                   ## imm = 0x4DE1
00000000000030f6	callq	_dsfmt_chk_init_gen_rand
00000000000030fb	xorps	%xmm0, %xmm0
00000000000030fe	movups	%xmm0, 0xc10(%rbx)
0000000000003105	movq	$0x0, 0xc20(%rbx)
0000000000003110	addq	$0x8, %rsp
0000000000003114	popq	%rbx
0000000000003115	popq	%rbp
0000000000003116	retq
