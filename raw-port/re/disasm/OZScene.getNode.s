__ZN7OZScene7getNodeEj:
000000000004f9a0	pushq	%rbp
000000000004f9a1	movq	%rsp, %rbp
000000000004f9a4	addq	$0x440, %rdi                    ## imm = 0x440
000000000004f9ab	callq	__ZN7OZScene9OZNodeMapixEj      ## OZScene::OZNodeMap::operator[](unsigned int)
000000000004f9b0	testq	%rax, %rax
000000000004f9b3	je	0x4f9d1
000000000004f9b5	leaq	__ZTI19OZObjectManipulator(%rip), %rsi ## typeinfo for OZObjectManipulator
000000000004f9bc	leaq	__ZTI11OZSceneNode(%rip), %rdx  ## typeinfo for OZSceneNode
000000000004f9c3	movl	$0x10, %ecx
000000000004f9c8	movq	%rax, %rdi
000000000004f9cb	popq	%rbp
000000000004f9cc	jmp	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000004f9d1	xorl	%eax, %eax
000000000004f9d3	popq	%rbp
000000000004f9d4	retq
000000000004f9d5	nopw	%cs:(%rax,%rax)
