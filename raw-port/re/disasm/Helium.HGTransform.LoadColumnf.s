__ZN11HGTransform11LoadColumnfEPKfi:
00000000001b44d0	pushq	%rbp
00000000001b44d1	movq	%rsp, %rbp
00000000001b44d4	shll	$0x2, %edx
00000000001b44d7	movslq	%edx, %rax
00000000001b44da	cvtps2pd	(%rsi), %xmm0
00000000001b44dd	movups	%xmm0, 0x10(%rdi,%rax,8)
00000000001b44e2	cvtps2pd	0x8(%rsi), %xmm0
00000000001b44e6	movups	%xmm0, 0x20(%rdi,%rax,8)
00000000001b44eb	popq	%rbp
00000000001b44ec	retq
00000000001b44ed	nopl	(%rax)
