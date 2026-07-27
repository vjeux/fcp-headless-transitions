__ZN9OZElement12parseElementER22PCSerializerReadStreamR15PCStreamElement:
000000000009e730	pushq	%rbp
000000000009e731	movq	%rsp, %rbp
000000000009e734	pushq	%r15
000000000009e736	pushq	%r14
000000000009e738	pushq	%rbx
000000000009e739	subq	$0x38, %rsp
000000000009e73d	movq	%rdx, %r15
000000000009e740	movq	%rsi, %r14
000000000009e743	movq	%rdi, %rbx
000000000009e746	leaq	-0x30(%rbp), %rdi
000000000009e74a	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
000000000009e74f	movq	%rbx, %rdi
000000000009e752	movq	%r14, %rsi
000000000009e755	movq	%r15, %rdx
000000000009e758	callq	__ZN15OZTransformNode12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZTransformNode::parseElement(PCSerializerReadStream&, PCStreamElement&)
000000000009e75d	movl	0x8(%r15), %eax
000000000009e761	cmpl	$0x46, %eax
000000000009e764	je	0x9e7cc
000000000009e766	cmpl	$0x190, %eax                    ## imm = 0x190
000000000009e76b	je	0x9e7b4
000000000009e76d	cmpl	$0x191, %eax                    ## imm = 0x191
000000000009e772	jne	0x9e910
000000000009e778	leaq	-0x28(%rbp), %rdi
000000000009e77c	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
000000000009e781	movq	(%r15), %rax
000000000009e784	leaq	-0x28(%rbp), %rsi
000000000009e788	movq	%r15, %rdi
000000000009e78b	callq	*0x10(%rax)
000000000009e78e	leaq	-0x44(%rbp), %rdi
000000000009e792	leaq	-0x28(%rbp), %rsi
000000000009e796	callq	0x6df4aa                        ## symbol stub for: __ZN9PCHash128C1ERK8PCString
000000000009e79b	movups	-0x44(%rbp), %xmm0
000000000009e79f	movups	%xmm0, 0x4918(%rbx)
000000000009e7a6	leaq	-0x28(%rbp), %rdi
000000000009e7aa	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000009e7af	jmp	0x9e910
000000000009e7b4	addq	$0x47d0, %rbx                   ## imm = 0x47D0
000000000009e7bb	movq	(%r15), %rax
000000000009e7be	movq	%r15, %rdi
000000000009e7c1	movq	%rbx, %rsi
000000000009e7c4	callq	*0x20(%rax)
000000000009e7c7	jmp	0x9e910
000000000009e7cc	leaq	-0x34(%rbp), %rcx
000000000009e7d0	movq	%r14, %rdi
000000000009e7d3	movq	%r15, %rsi
000000000009e7d6	movl	$0x71, %edx
000000000009e7db	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000009e7e0	leaq	-0x30(%rbp), %rcx
000000000009e7e4	movq	%r14, %rdi
000000000009e7e7	movq	%r15, %rsi
000000000009e7ea	movl	$0x6e, %edx
000000000009e7ef	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
000000000009e7f4	leaq	-0x1c(%rbp), %rcx
000000000009e7f8	movq	%r14, %rdi
000000000009e7fb	movq	%r15, %rsi
000000000009e7fe	movl	$0x6f, %edx
000000000009e803	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000009e808	leaq	_theApp(%rip), %rax
000000000009e80f	movq	(%rax), %rax
000000000009e812	movl	-0x34(%rbp), %esi
000000000009e815	movq	0x20(%rax), %rdi
000000000009e819	callq	0x6dd5ba                        ## symbol stub for: __ZN11OZFactories13lookupFactoryEj
000000000009e81e	testq	%rax, %rax
000000000009e821	je	0x9e910
000000000009e827	movq	0x78404a(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
000000000009e82e	movq	0x7886db(%rip), %rdx            ## literal pool symbol address: __ZTI18OZSceneNodeFactory
000000000009e835	movq	%rax, %rdi
000000000009e838	xorl	%ecx, %ecx
000000000009e83a	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000009e83f	testq	%rax, %rax
000000000009e842	je	0x9e910
000000000009e848	movl	-0x1c(%rbp), %edx
000000000009e84b	movq	(%rax), %rcx
000000000009e84e	leaq	-0x30(%rbp), %rsi
000000000009e852	movq	%rax, %rdi
000000000009e855	callq	*0xa8(%rcx)
000000000009e85b	movq	%rax, %r15
000000000009e85e	testq	%rax, %rax
000000000009e861	je	0x9e910
000000000009e867	movl	-0x1c(%rbp), %esi
000000000009e86a	leaq	0x30(%r15), %rdi
000000000009e86e	callq	0x6dd8fc                        ## symbol stub for: __ZN13OZChannelBase5setIDEj
000000000009e873	movq	(%r15), %rax
000000000009e876	movq	%r15, %rdi
000000000009e879	movq	%rbx, %rsi
000000000009e87c	callq	*0x100(%rax)
000000000009e882	movq	(%r15), %rax
000000000009e885	movq	%r15, %rdi
000000000009e888	callq	*0x420(%rax)
000000000009e88e	movl	$0x18, %edi
000000000009e893	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000009e898	leaq	0x47e0(%rbx), %rcx
000000000009e89f	movq	%r15, 0x10(%rax)
000000000009e8a3	movq	%rcx, 0x8(%rax)
000000000009e8a7	movq	0x47e0(%rbx), %rcx
000000000009e8ae	movq	%rcx, (%rax)
000000000009e8b1	movq	%rax, 0x8(%rcx)
000000000009e8b5	movq	%rax, 0x47e0(%rbx)
000000000009e8bc	incq	0x47f0(%rbx)
000000000009e8c3	movq	(%r15), %rax
000000000009e8c6	movq	%r15, %rdi
000000000009e8c9	callq	*0x280(%rax)
000000000009e8cf	leaq	0x47f8(%rbx), %rdi
000000000009e8d6	movq	%rax, %rsi
000000000009e8d9	callq	0x6ddfec                        ## symbol stub for: __ZN15OZChannelFolder9push_backEP13OZChannelBase
000000000009e8de	movq	0x3c0(%rbx), %rdi
000000000009e8e5	testq	%rdi, %rdi
000000000009e8e8	je	0x9e901
000000000009e8ea	movq	%r15, %rsi
000000000009e8ed	callq	__ZN7OZScene12registerNodeEP11OZSceneNode ## OZScene::registerNode(OZSceneNode*)
000000000009e8f2	movq	0x3c0(%rbx), %rdi
000000000009e8f9	movq	%r15, %rsi
000000000009e8fc	callq	__ZN7OZScene18addAllDependenciesEP11OZSceneNode ## OZScene::addAllDependencies(OZSceneNode*)
000000000009e901	addq	$0x28, %r15
000000000009e905	movq	%r14, %rdi
000000000009e908	movq	%r15, %rsi
000000000009e90b	callq	0x6de790                        ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
000000000009e910	leaq	-0x30(%rbp), %rdi
000000000009e914	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000009e919	movb	$0x1, %al
000000000009e91b	addq	$0x38, %rsp
000000000009e91f	popq	%rbx
000000000009e920	popq	%r14
000000000009e922	popq	%r15
000000000009e924	popq	%rbp
000000000009e925	retq
000000000009e926	jmp	0x9e928
000000000009e928	movq	%rax, %rbx
000000000009e92b	leaq	-0x28(%rbp), %rdi
000000000009e92f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000009e934	leaq	-0x30(%rbp), %rdi
000000000009e938	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000009e93d	movq	%rbx, %rdi
000000000009e940	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000009e945	jmp	0x9e947
000000000009e947	movq	%rax, %rbx
000000000009e94a	leaq	-0x30(%rbp), %rdi
000000000009e94e	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000009e953	movq	%rbx, %rdi
000000000009e956	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000009e95b	nopl	(%rax,%rax)
