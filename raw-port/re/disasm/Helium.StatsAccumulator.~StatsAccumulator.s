__ZN16StatsAccumulatorD1Ev:
00000000000f3060	pushq	%rbp
00000000000f3061	movq	%rsp, %rbp
00000000000f3064	movq	%rdi, %rax
00000000000f3067	movq	(%rdi), %rdi
00000000000f306a	testq	%rdi, %rdi
00000000000f306d	je	0xf3079
00000000000f306f	movq	%rdi, 0x8(%rax)
00000000000f3073	popq	%rbp
00000000000f3074	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000000f3079	popq	%rbp
00000000000f307a	retq
00000000000f307b	nopl	(%rax,%rax)
