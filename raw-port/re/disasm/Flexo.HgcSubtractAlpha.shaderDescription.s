__ZNK16HgcSubtractAlpha17shaderDescriptionEv:
000000000146e230	pushq	%rbp
000000000146e231	movq	%rsp, %rbp
000000000146e234	pushq	%rbx
000000000146e235	pushq	%rax
000000000146e236	movq	%rdi, %rbx
000000000146e239	movl	$0x1a, %edi
000000000146e23e	callq	0x1497452                       ## symbol stub for: __Znwm
000000000146e243	movq	%rax, 0x10(%rbx)
000000000146e247	movq	$0x1b, (%rbx)
000000000146e24e	movq	$0x17, 0x8(%rbx)
000000000146e256	movabsq	$0x5d316367685b2061, %rcx       ## imm = 0x5D316367685B2061
000000000146e260	movq	%rcx, 0xf(%rax)
000000000146e264	movups	0x241909(%rip), %xmm0           ## literal pool for: "HgcSubtractAlpha [hgc1]"
000000000146e26b	movups	%xmm0, (%rax)
000000000146e26e	movb	$0x0, 0x17(%rax)
000000000146e272	movq	%rbx, %rax
000000000146e275	addq	$0x8, %rsp
000000000146e279	popq	%rbx
000000000146e27a	popq	%rbp
000000000146e27b	retq
000000000146e27c	nopl	(%rax)
