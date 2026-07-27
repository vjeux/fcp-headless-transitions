
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000447a6 <__ZN15OZInterpolators15getInterpolatorEj>:
   447a6: 55                           	pushq	%rbp
   447a7: 48 89 e5                     	movq	%rsp, %rbp
   447aa: 41 56                        	pushq	%r14
   447ac: 53                           	pushq	%rbx
   447ad: 48 89 fb                     	movq	%rdi, %rbx
   447b0: 83 fe 0a                     	cmpl	$0xa, %esi
   447b3: 74 3c                        	je	0x447f1 <__ZN15OZInterpolators15getInterpolatorEj+0x4b>
   447b5: 83 fe 0c                     	cmpl	$0xc, %esi
   447b8: 75 6e                        	jne	0x44828 <__ZN15OZInterpolators15getInterpolatorEj+0x82>
   447ba: 48 8b 43 08                  	movq	0x8(%rbx), %rax
   447be: 48 85 c0                     	testq	%rax, %rax
   447c1: 75 28                        	jne	0x447eb <__ZN15OZInterpolators15getInterpolatorEj+0x45>
   447c3: bf 28 00 00 00               	movl	$0x28, %edi
   447c8: e8 7f 86 06 00               	callq	0xace4c <_tan+0xace4c>
   447cd: 49 89 c6                     	movq	%rax, %r14
   447d0: 48 89 c7                     	movq	%rax, %rdi
   447d3: e8 d6 16 00 00               	callq	0x45eae <__ZN21OZXSplineInterpolatorC1Ev>
   447d8: 31 c0                        	xorl	%eax, %eax
   447da: f0                           	lock
   447db: 4c 0f b1 73 08               	cmpxchgq	%r14, 0x8(%rbx)
   447e0: 74 09                        	je	0x447eb <__ZN15OZInterpolators15getInterpolatorEj+0x45>
   447e2: 49 8b 06                     	movq	(%r14), %rax
   447e5: 4c 89 f7                     	movq	%r14, %rdi
   447e8: ff 50 08                     	callq	*0x8(%rax)
   447eb: 48 8b 43 08                  	movq	0x8(%rbx), %rax
   447ef: eb 32                        	jmp	0x44823 <__ZN15OZInterpolators15getInterpolatorEj+0x7d>
   447f1: 48 8b 03                     	movq	(%rbx), %rax
   447f4: 48 85 c0                     	testq	%rax, %rax
   447f7: 75 27                        	jne	0x44820 <__ZN15OZInterpolators15getInterpolatorEj+0x7a>
   447f9: bf 78 00 00 00               	movl	$0x78, %edi
   447fe: e8 49 86 06 00               	callq	0xace4c <_tan+0xace4c>
   44803: 49 89 c6                     	movq	%rax, %r14
   44806: 48 89 c7                     	movq	%rax, %rdi
   44809: e8 0e d1 ff ff               	callq	0x4191c <__ZN21OZBSplineInterpolatorC1Ev>
   4480e: 31 c0                        	xorl	%eax, %eax
   44810: f0                           	lock
   44811: 4c 0f b1 33                  	cmpxchgq	%r14, (%rbx)
   44815: 74 09                        	je	0x44820 <__ZN15OZInterpolators15getInterpolatorEj+0x7a>
   44817: 49 8b 06                     	movq	(%r14), %rax
   4481a: 4c 89 f7                     	movq	%r14, %rdi
   4481d: ff 50 08                     	callq	*0x8(%rax)
   44820: 48 8b 03                     	movq	(%rbx), %rax
   44823: 5b                           	popq	%rbx
   44824: 41 5e                        	popq	%r14
   44826: 5d                           	popq	%rbp
   44827: c3                           	retq
   44828: 48 8b 7b 10                  	movq	0x10(%rbx), %rdi
   4482c: 5b                           	popq	%rbx
   4482d: 41 5e                        	popq	%r14
   4482f: 5d                           	popq	%rbp
   44830: e9 a7 05 00 00               	jmp	0x44ddc <__ZN24OZInterpolatorStrategies15getInterpolatorEj>
   44835: eb 00                        	jmp	0x44837 <__ZN15OZInterpolators15getInterpolatorEj+0x91>
   44837: 48 89 c3                     	movq	%rax, %rbx
   4483a: 4c 89 f7                     	movq	%r14, %rdi
   4483d: e8 c2 85 06 00               	callq	0xace04 <_tan+0xace04>
