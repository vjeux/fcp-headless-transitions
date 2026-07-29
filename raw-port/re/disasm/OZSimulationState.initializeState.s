__ZN17OZSimulationState15initializeStateERK6CMTime:
00000000001f0b50	pushq	%rbp
00000000001f0b51	movq	%rsp, %rbp
00000000001f0b52	movl	%esp, %ebp
00000000001f0b54	xorps	%xmm0, %xmm0
00000000001f0b57	movups	%xmm0, (%rdi)
00000000001f0b5a	movq	$0x0, 0x10(%rdi)
00000000001f0b62	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001f0b6c	movq	%rax, 0x18(%rdi)
00000000001f0b70	movups	%xmm0, 0x20(%rdi)
00000000001f0b74	movups	%xmm0, 0x30(%rdi)
00000000001f0b78	movups	%xmm0, 0x40(%rdi)
00000000001f0b7c	movups	%xmm0, 0x50(%rdi)
00000000001f0b80	movups	%xmm0, 0x60(%rdi)
00000000001f0b84	movups	%xmm0, 0x70(%rdi)
00000000001f0b88	movups	%xmm0, 0x80(%rdi)
00000000001f0b8f	movups	%xmm0, 0x90(%rdi)
00000000001f0b96	movups	%xmm0, 0xa0(%rdi)
00000000001f0b9d	movups	(%rsi), %xmm0
00000000001f0ba0	movups	%xmm0, 0xb0(%rdi)
00000000001f0ba7	movq	0x10(%rsi), %rax
00000000001f0bab	movq	%rax, 0xc0(%rdi)
00000000001f0bb2	popq	%rbp
00000000001f0bb3	retq
00000000001f0bb4	nopw	%cs:(%rax,%rax)
