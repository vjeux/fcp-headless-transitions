__ZN10PTTriangleaSERKS_:
00000000002ffbb0	pushq	%rbp
00000000002ffbb1	movq	%rsp, %rbp
00000000002ffbb4	movq	%rdi, %rax
00000000002ffbb7	movq	(%rsi), %rcx
00000000002ffbba	movq	%rcx, (%rdi)
00000000002ffbbd	movq	0x8(%rsi), %rcx
00000000002ffbc1	movq	%rcx, 0x8(%rdi)
00000000002ffbc5	movq	0x10(%rsi), %rcx
00000000002ffbc9	movq	%rcx, 0x10(%rdi)
00000000002ffbcd	movq	0x18(%rsi), %rcx
00000000002ffbd1	movq	%rcx, 0x18(%rdi)
00000000002ffbd5	cmpq	%rdi, %rsi
00000000002ffbd8	je	0x2ffc96
00000000002ffbde	movsd	0x20(%rsi), %xmm0
00000000002ffbe3	movsd	%xmm0, 0x20(%rax)
00000000002ffbe8	movsd	0x28(%rsi), %xmm0
00000000002ffbed	movsd	%xmm0, 0x28(%rax)
00000000002ffbf2	movsd	0x30(%rsi), %xmm0
00000000002ffbf7	movsd	%xmm0, 0x30(%rax)
00000000002ffbfc	movsd	0x38(%rsi), %xmm0
00000000002ffc01	movsd	%xmm0, 0x38(%rax)
00000000002ffc06	movsd	0x40(%rsi), %xmm0
00000000002ffc0b	movsd	%xmm0, 0x40(%rax)
00000000002ffc10	movsd	0x48(%rsi), %xmm0
00000000002ffc15	movsd	%xmm0, 0x48(%rax)
00000000002ffc1a	movsd	0x50(%rsi), %xmm0
00000000002ffc1f	movsd	%xmm0, 0x50(%rax)
00000000002ffc24	movsd	0x58(%rsi), %xmm0
00000000002ffc29	movsd	%xmm0, 0x58(%rax)
00000000002ffc2e	movsd	0x60(%rsi), %xmm0
00000000002ffc33	movsd	%xmm0, 0x60(%rax)
00000000002ffc38	movsd	0x68(%rsi), %xmm0
00000000002ffc3d	movsd	%xmm0, 0x68(%rax)
00000000002ffc42	movsd	0x70(%rsi), %xmm0
00000000002ffc47	movsd	%xmm0, 0x70(%rax)
00000000002ffc4c	movsd	0x78(%rsi), %xmm0
00000000002ffc51	movsd	%xmm0, 0x78(%rax)
00000000002ffc56	movsd	0x80(%rsi), %xmm0
00000000002ffc5e	movsd	%xmm0, 0x80(%rax)
00000000002ffc66	movsd	0x88(%rsi), %xmm0
00000000002ffc6e	movsd	%xmm0, 0x88(%rax)
00000000002ffc76	movsd	0x90(%rsi), %xmm0
00000000002ffc7e	movsd	%xmm0, 0x90(%rax)
00000000002ffc86	movsd	0x98(%rsi), %xmm0
00000000002ffc8e	movsd	%xmm0, 0x98(%rax)
00000000002ffc96	movq	0xa0(%rsi), %rcx
00000000002ffc9d	movq	%rcx, 0xa0(%rax)
00000000002ffca4	popq	%rbp
00000000002ffca5	retq
00000000002ffca6	nopw	%cs:(%rax,%rax)
