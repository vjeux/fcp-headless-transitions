__ZN12OZTimeMarkerC1E6CMTime:
0000000000210590	pushq	%rbp
0000000000210591	movq	%rsp, %rbp
0000000000210594	pushq	%r14
0000000000210596	pushq	%rbx
0000000000210597	movq	%rdi, %rbx
000000000021059a	leaq	0x636d5f(%rip), %rax
00000000002105a1	movq	%rax, (%rdi)
00000000002105a4	movaps	0x10(%rbp), %xmm0
00000000002105a8	movups	%xmm0, 0x8(%rdi)
00000000002105ac	movq	0x20(%rbp), %rax
00000000002105b0	movq	%rax, 0x18(%rdi)
00000000002105b4	movq	0x613f55(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
00000000002105bb	movups	(%rax), %xmm0
00000000002105be	movups	%xmm0, 0x20(%rdi)
00000000002105c2	movq	0x10(%rax), %rax
00000000002105c6	movq	%rax, 0x30(%rdi)
00000000002105ca	leaq	0x38(%rdi), %r14
00000000002105ce	movq	%r14, %rdi
00000000002105d1	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
00000000002105d6	leaq	0x40(%rbx), %rdi
00000000002105da	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
00000000002105df	movq	$0x1, 0x48(%rbx)
00000000002105e7	popq	%rbx
00000000002105e8	popq	%r14
00000000002105ea	popq	%rbp
00000000002105eb	retq
00000000002105ec	movq	%rax, %rbx
00000000002105ef	movq	%r14, %rdi
00000000002105f2	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000002105f7	movq	%rbx, %rdi
00000000002105fa	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002105ff	nop
