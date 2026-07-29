__ZNK11HGTransform18GetMatrixdouble4x4EPN4simd9double4x4E:
00000000001b4420	pushq	%rbp
00000000001b4421	movq	%rsp, %rbp
00000000001b4424	movups	0x10(%rdi), %xmm0
00000000001b4428	movups	0x20(%rdi), %xmm1
00000000001b442c	movups	0x30(%rdi), %xmm2
00000000001b4430	movups	0x40(%rdi), %xmm3
00000000001b4434	movups	0x60(%rdi), %xmm4
00000000001b4438	movups	0x50(%rdi), %xmm5
00000000001b443c	movups	0x80(%rdi), %xmm6
00000000001b4443	movups	0x70(%rdi), %xmm7
00000000001b4447	movaps	%xmm0, (%rsi)
00000000001b444a	movaps	%xmm1, 0x10(%rsi)
00000000001b444e	movaps	%xmm2, 0x20(%rsi)
00000000001b4452	movaps	%xmm3, 0x30(%rsi)
00000000001b4456	movaps	%xmm5, 0x40(%rsi)
00000000001b445a	movaps	%xmm4, 0x50(%rsi)
00000000001b445e	movaps	%xmm7, 0x60(%rsi)
00000000001b4462	movaps	%xmm6, 0x70(%rsi)
00000000001b4466	popq	%rbp
00000000001b4467	retq
00000000001b4468	nopl	(%rax,%rax)
