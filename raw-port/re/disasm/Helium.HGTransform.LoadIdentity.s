__ZN11HGTransform12LoadIdentityEv:
00000000001b4480	pushq	%rbp
00000000001b4481	movq	%rsp, %rbp
00000000001b4484	xorps	%xmm0, %xmm0
00000000001b4487	movups	%xmm0, 0x38(%rdi)
00000000001b448b	movups	%xmm0, 0x58(%rdi)
00000000001b448f	movups	%xmm0, 0x78(%rdi)
00000000001b4493	movups	%xmm0, 0x68(%rdi)
00000000001b4497	movups	%xmm0, 0x48(%rdi)
00000000001b449b	movups	%xmm0, 0x28(%rdi)
00000000001b449f	movups	%xmm0, 0x18(%rdi)
00000000001b44a3	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b44ad	movq	%rax, 0x10(%rdi)
00000000001b44b1	movq	%rax, 0x38(%rdi)
00000000001b44b5	movq	%rax, 0x60(%rdi)
00000000001b44b9	movq	%rax, 0x88(%rdi)
00000000001b44c0	popq	%rbp
00000000001b44c1	retq
00000000001b44c2	nopw	%cs:(%rax,%rax)
