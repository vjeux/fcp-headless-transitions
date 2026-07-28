__ZN24SetPixelBufferAttributes15setIntAttributeEPK10__CFStringi:
0000000000e41770	testq	%rsi, %rsi
0000000000e41773	je	0xe417c7
0000000000e41775	pushq	%rbp
0000000000e41776	movq	%rsp, %rbp
0000000000e41779	pushq	%r14
0000000000e4177b	pushq	%rbx
0000000000e4177c	subq	$0x10, %rsp
0000000000e41780	movq	%rsi, %rbx
0000000000e41783	movq	(%rdi), %r14
0000000000e41786	movl	%edx, -0x14(%rbp)
0000000000e41789	movq	0xaade78(%rip), %rax            ## literal pool symbol address: _kCFAllocatorDefault
0000000000e41790	movq	(%rax), %rdi
0000000000e41793	leaq	-0x14(%rbp), %rdx
0000000000e41797	movl	$0x9, %esi
0000000000e4179c	callq	0x149480c                       ## symbol stub for: _CFNumberCreate
0000000000e417a1	testq	%rax, %rax
0000000000e417a4	je	0xe417bf
0000000000e417a6	movq	%r14, %rdi
0000000000e417a9	movq	%rbx, %rsi
0000000000e417ac	movq	%rax, %rdx
0000000000e417af	movq	%rax, %rbx
0000000000e417b2	callq	0x149477c                       ## symbol stub for: _CFDictionaryAddValue
0000000000e417b7	movq	%rbx, %rdi
0000000000e417ba	callq	0x149484e                       ## symbol stub for: _CFRelease
0000000000e417bf	addq	$0x10, %rsp
0000000000e417c3	popq	%rbx
0000000000e417c4	popq	%r14
0000000000e417c6	popq	%rbp
0000000000e417c7	retq
0000000000e417c8	nopl	(%rax,%rax)
