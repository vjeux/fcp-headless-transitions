__ZN30OZ3DEnginePhysicsFieldBehavior16isExtentInfiniteERK6CMTime:
00000000004f0cc0	pushq	%rbp
00000000004f0cc1	movq	%rsp, %rbp
00000000004f0cc4	addq	$0x440, %rdi                    ## imm = 0x440
00000000004f0ccb	xorps	%xmm0, %xmm0
00000000004f0cce	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000004f0cd3	testl	%eax, %eax
00000000004f0cd5	setne	%al
00000000004f0cd8	popq	%rbp
00000000004f0cd9	retq
00000000004f0cda	nopw	(%rax,%rax)
